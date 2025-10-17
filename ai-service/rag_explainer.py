# ai-service/rag_explainer.py
"""
RAG (Retrieval-Augmented Generation) Explainability System.
Provides human-readable explanations for recommendations using:
- FAISS vector store for retrieval
- LLM prompting (OpenAI or local)
- Provenance tracking
"""
import json
import os
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import numpy as np

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False
    print("Warning: faiss not available. Install with: pip install faiss-cpu")

try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False

try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class DocumentStore:
    """
    Vector store for retrieval using FAISS.
    """
    
    def __init__(self, embedding_model: str = 'all-MiniLM-L6-v2',
                 index_path: Optional[str] = None):
        """
        Args:
            embedding_model: sentence-transformers model name
            index_path: path to saved FAISS index (optional)
        """
        if not SENTENCE_TRANSFORMERS_AVAILABLE:
            raise ImportError("sentence-transformers required")
        
        self.encoder = SentenceTransformer(embedding_model)
        self.dimension = self.encoder.get_sentence_embedding_dimension()
        
        # FAISS index
        if FAISS_AVAILABLE:
            self.index = faiss.IndexFlatL2(self.dimension)  # L2 distance
        else:
            self.index = None
            print("Warning: FAISS not available, using linear search fallback")
        
        # Document storage
        self.documents = []  # list of dicts
        self.embeddings = []  # list of numpy arrays
        
        # Load existing index if provided
        if index_path and Path(index_path).exists():
            self.load(index_path)
    
    def add_documents(self, documents: List[Dict]):
        """
        Add documents to the store.
        
        Args:
            documents: list of dicts with at least 'text' and 'id' keys
                      can also include 'type', 'metadata', etc.
        """
        for doc in documents:
            if 'text' not in doc:
                continue
            
            # Embed
            embedding = self.encoder.encode(doc['text'], convert_to_numpy=True)
            
            # Store
            self.documents.append(doc)
            self.embeddings.append(embedding)
            
            # Add to FAISS index
            if self.index is not None:
                self.index.add(np.array([embedding], dtype='float32'))
    
    def search(self, query: str, top_k: int = 5,
               filter_type: Optional[str] = None) -> List[Tuple[Dict, float]]:
        """
        Search for relevant documents.
        
        Args:
            query: query text
            top_k: number of results to return
            filter_type: optional filter by document type
            
        Returns:
            list of (document, distance) tuples
        """
        if not self.documents:
            return []
        
        # Embed query
        query_emb = self.encoder.encode(query, convert_to_numpy=True)
        
        if self.index is not None and FAISS_AVAILABLE:
            # FAISS search
            distances, indices = self.index.search(
                np.array([query_emb], dtype='float32'), 
                min(top_k * 2, len(self.documents))  # get extra for filtering
            )
            
            results = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx < len(self.documents):
                    doc = self.documents[idx]
                    if filter_type is None or doc.get('type') == filter_type:
                        results.append((doc, float(dist)))
                        if len(results) >= top_k:
                            break
        else:
            # Fallback: linear search with cosine similarity
            scores = []
            for i, emb in enumerate(self.embeddings):
                # Cosine similarity
                sim = np.dot(query_emb, emb) / (np.linalg.norm(query_emb) * np.linalg.norm(emb))
                scores.append((i, sim))
            
            # Sort by similarity (descending)
            scores.sort(key=lambda x: -x[1])
            
            results = []
            for idx, sim in scores[:top_k * 2]:
                doc = self.documents[idx]
                if filter_type is None or doc.get('type') == filter_type:
                    results.append((doc, 1 - sim))  # convert to distance
                    if len(results) >= top_k:
                        break
        
        return results
    
    def save(self, path: str):
        """Save index and documents to disk."""
        output_dir = Path(path).parent
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save FAISS index
        if self.index is not None and FAISS_AVAILABLE:
            faiss.write_index(self.index, path)
        
        # Save documents
        docs_path = Path(path).with_suffix('.json')
        with open(docs_path, 'w') as f:
            json.dump({
                'documents': self.documents,
                'dimension': self.dimension
            }, f)
    
    def load(self, path: str):
        """Load index and documents from disk."""
        # Load FAISS index
        if Path(path).exists() and FAISS_AVAILABLE:
            self.index = faiss.read_index(path)
        
        # Load documents
        docs_path = Path(path).with_suffix('.json')
        if docs_path.exists():
            with open(docs_path, 'r') as f:
                data = json.load(f)
                self.documents = data['documents']
                
                # Rebuild embeddings from documents
                self.embeddings = [
                    self.encoder.encode(doc['text'], convert_to_numpy=True)
                    for doc in self.documents
                ]


class LLMExplainer:
    """
    Generate explanations using LLM (OpenAI or template-based fallback).
    """
    
    def __init__(self, api_key: Optional[str] = None, 
                 model: str = 'gpt-3.5-turbo',
                 use_openai: bool = True):
        """
        Args:
            api_key: OpenAI API key (or set OPENAI_API_KEY env var)
            model: OpenAI model name
            use_openai: if False, use template-based fallback
        """
        self.use_openai = use_openai and OPENAI_AVAILABLE
        
        if self.use_openai:
            api_key = api_key or os.getenv('OPENAI_API_KEY')
            if api_key:
                openai.api_key = api_key
            else:
                print("Warning: No OpenAI API key found, falling back to templates")
                self.use_openai = False
        
        self.model = model
    
    def explain_recommendation(self, 
                             resource: Dict,
                             student_mastery: Dict[str, float],
                             concept: str,
                             context_docs: List[Dict]) -> Dict[str, str]:
        """
        Generate explanation for why a resource was recommended.
        
        Args:
            resource: resource dict with title, description, etc.
            student_mastery: dict of concept -> mastery score
            concept: target concept being learned
            context_docs: retrieved context documents
            
        Returns:
            dict with 'explanation', 'action', 'provenance'
        """
        if self.use_openai:
            return self._explain_with_llm(resource, student_mastery, concept, context_docs)
        else:
            return self._explain_with_template(resource, student_mastery, concept, context_docs)
    
    def _explain_with_llm(self, resource, student_mastery, concept, context_docs):
        """Generate explanation using OpenAI API."""
        # Prepare context
        context_text = "\n\n".join([
            f"[{doc.get('type', 'doc')}] {doc.get('text', '')[:200]}"
            for doc in context_docs
        ])
        
        mastery_text = ", ".join([f"{k}={v:.2f}" for k, v in student_mastery.items()])
        
        prompt = f"""Context: Student mastery: {mastery_text}. 
Target concept: {concept}.
Resource: {resource.get('title', 'Untitled')} - {resource.get('description', '')}

Supporting context:
{context_text}

Task: In 2-3 short sentences, explain:
1. Why this resource helps the student learn {concept} right now.
2. One specific action the student should take after consuming this resource.

Be concise, factual, and reference specific evidence from the context."""
        
        try:
            response = openai.ChatCompletion.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an educational AI assistant providing clear, evidence-based explanations."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            explanation = response.choices[0].message.content.strip()
            
            # Parse into reason and action (simple split)
            lines = explanation.split('\n')
            reason = lines[0] if lines else explanation
            action = lines[1] if len(lines) > 1 else "Complete the resource and test your understanding."
            
            return {
                'explanation': reason,
                'action': action,
                'provenance': [doc.get('id', 'unknown') for doc in context_docs]
            }
        
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._explain_with_template(resource, student_mastery, concept, context_docs)
    
    def _explain_with_template(self, resource, student_mastery, concept, context_docs):
        """Generate explanation using templates (fallback)."""
        mastery_score = student_mastery.get(concept, 0.0)
        
        # Reason based on mastery level
        if mastery_score < 0.3:
            reason = f"This resource introduces {concept} from the basics, perfect for building your foundation."
        elif mastery_score < 0.7:
            reason = f"This resource deepens your understanding of {concept} with intermediate examples."
        else:
            reason = f"This resource covers advanced aspects of {concept} to refine your mastery."
        
        # Add prerequisite context if available
        prereq_docs = [d for d in context_docs if d.get('type') == 'prerequisite']
        if prereq_docs and mastery_score < 0.5:
            prereqs = prereq_docs[0].get('text', '')
            reason += f" Note: {prereqs[:100]}"
        
        # Action
        action = f"Complete the resource, then attempt 2-3 practice problems on {concept}."
        
        return {
            'explanation': reason,
            'action': action,
            'provenance': [doc.get('id', 'template') for doc in context_docs]
        }


class RAGExplainer:
    """
    End-to-end RAG explanation system.
    """
    
    def __init__(self, 
                 knowledge_graph: Optional[Dict] = None,
                 resource_metadata: Optional[List[Dict]] = None,
                 student_outcomes: Optional[Dict] = None,
                 index_path: Optional[str] = None,
                 openai_api_key: Optional[str] = None):
        """
        Args:
            knowledge_graph: concept graph (prereqs, etc.)
            resource_metadata: list of resource dicts
            student_outcomes: historical outcome data
            index_path: path to FAISS index
            openai_api_key: OpenAI API key (optional)
        """
        self.doc_store = DocumentStore(index_path=index_path)
        self.llm_explainer = LLMExplainer(api_key=openai_api_key)
        
        # Index documents if provided
        if knowledge_graph:
            self._index_knowledge_graph(knowledge_graph)
        
        if resource_metadata:
            self._index_resources(resource_metadata)
        
        if student_outcomes:
            self._index_outcomes(student_outcomes)
    
    def _index_knowledge_graph(self, kg: Dict):
        """Index knowledge graph as documents."""
        docs = []
        for concept, data in kg.items():
            # Add prerequisite info
            prereqs = data.get('prereqs', [])
            if prereqs:
                text = f"To learn {concept}, students should first master: {', '.join(prereqs)}"
                docs.append({
                    'id': f'kg_prereq_{concept}',
                    'type': 'prerequisite',
                    'text': text,
                    'concept': concept
                })
        
        self.doc_store.add_documents(docs)
    
    def _index_resources(self, resources: List[Dict]):
        """Index resource metadata."""
        docs = []
        for res in resources:
            text = f"{res.get('title', '')}. {res.get('description', '')} "
            text += f"Covers: {', '.join(res.get('concepts', []))}"
            
            docs.append({
                'id': res.get('id', ''),
                'type': 'resource',
                'text': text,
                'metadata': res
            })
        
        self.doc_store.add_documents(docs)
    
    def _index_outcomes(self, outcomes: Dict):
        """Index student outcome data."""
        docs = []
        for resource_id, data in outcomes.items():
            success_rate = data.get('success_rate', 0)
            n = data.get('n_students', 0)
            
            text = f"Resource {resource_id}: {n} students used it, {success_rate:.1%} passed next assessment."
            
            docs.append({
                'id': f'outcome_{resource_id}',
                'type': 'outcome',
                'text': text,
                'resource_id': resource_id
            })
        
        self.doc_store.add_documents(docs)
    
    def explain(self, 
                resource: Dict,
                student_mastery: Dict[str, float],
                concept: str,
                n_context: int = 5) -> Dict:
        """
        Generate explanation for recommendation.
        
        Args:
            resource: recommended resource
            student_mastery: student's mastery scores
            concept: target concept
            n_context: number of context docs to retrieve
            
        Returns:
            explanation dict
        """
        # Build retrieval query
        query = f"Why learn {concept}? Current mastery: {student_mastery.get(concept, 0):.2f}. "
        query += f"Resource: {resource.get('title', '')}"
        
        # Retrieve context
        context_docs = self.doc_store.search(query, top_k=n_context)
        context_docs = [doc for doc, _ in context_docs]  # drop distances
        
        # Generate explanation
        explanation = self.llm_explainer.explain_recommendation(
            resource, student_mastery, concept, context_docs
        )
        
        # Add retrieved context for transparency
        explanation['retrieved_context'] = [
            {
                'type': doc.get('type'),
                'text': doc.get('text', '')[:150] + '...',
                'id': doc.get('id')
            }
            for doc in context_docs
        ]
        
        return explanation
    
    def save_index(self, path: str):
        """Save FAISS index to disk."""
        self.doc_store.save(path)


# Example usage
if __name__ == '__main__':
    # Example: create explainer and generate explanation
    rag = RAGExplainer(
        knowledge_graph={
            'loops': {'prereqs': ['variables']},
            'variables': {'prereqs': []}
        },
        resource_metadata=[
            {
                'id': 'res_1',
                'title': 'Intro to For Loops',
                'description': 'Learn basic for loop syntax and iteration',
                'concepts': ['loops']
            }
        ]
    )
    
    explanation = rag.explain(
        resource={'id': 'res_1', 'title': 'Intro to For Loops'},
        student_mastery={'variables': 0.8, 'loops': 0.3},
        concept='loops'
    )
    
    print(json.dumps(explanation, indent=2))

