# ai-service/models/dkt.py
"""
Deep Knowledge Tracing (DKT) model using LSTM.
Predicts student mastery and next-question correctness.
"""
import torch
import torch.nn as nn
import numpy as np
from typing import Dict, List, Tuple, Optional
import json
from pathlib import Path


class DKT(nn.Module):
    """
    Deep Knowledge Tracing LSTM model.
    
    Input: sequence of (question_id, correctness) pairs
    Output: probability of correctness for each question at each timestep
    """
    
    def __init__(self, n_questions: int, embed_dim: int = 128, 
                 hidden_dim: int = 128, n_layers: int = 1, dropout: float = 0.2):
        super().__init__()
        self.n_questions = n_questions
        self.embed_dim = embed_dim
        self.hidden_dim = hidden_dim
        
        # Embedding: question_id * 2 (for correct/incorrect)
        self.q_embed = nn.Embedding(n_questions * 2, embed_dim)
        
        # LSTM for sequence modeling
        self.lstm = nn.LSTM(
            embed_dim, 
            hidden_dim, 
            n_layers, 
            batch_first=True,
            dropout=dropout if n_layers > 1 else 0
        )
        
        # Output layer: predict probability for each question
        self.fc = nn.Linear(hidden_dim, n_questions)
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x: torch.Tensor, 
                hidden: Optional[Tuple[torch.Tensor, torch.Tensor]] = None):
        """
        Args:
            x: (batch_size, seq_len) - encoded as question_id * 2 + correctness
            hidden: optional (h_0, c_0) for LSTM
            
        Returns:
            probs: (batch_size, seq_len, n_questions) - probability of correctness
            hidden: (h_n, c_n) final hidden state
        """
        batch_size, seq_len = x.shape
        
        # Embed
        embedded = self.q_embed(x)  # (batch, seq_len, embed_dim)
        embedded = self.dropout(embedded)
        
        # LSTM
        if hidden is not None:
            output, hidden = self.lstm(embedded, hidden)
        else:
            output, hidden = self.lstm(embedded)
        
        output = self.dropout(output)
        
        # Predict
        logits = self.fc(output)  # (batch, seq_len, n_questions)
        probs = torch.sigmoid(logits)
        
        return probs, hidden


class DKTPredictor:
    """
    Wrapper for DKT model to handle inference and concept aggregation.
    """
    
    def __init__(self, model_path: Optional[str] = None, 
                 concept_to_questions: Optional[Dict[str, List[int]]] = None,
                 device: str = 'cpu'):
        """
        Args:
            model_path: path to saved model checkpoint
            concept_to_questions: mapping from concept name to list of question IDs
            device: 'cpu' or 'cuda'
        """
        self.device = device
        self.model = None
        self.concept_to_questions = concept_to_questions or {}
        self.question_to_concept = {}
        
        # Build reverse mapping
        for concept, qids in self.concept_to_questions.items():
            for qid in qids:
                self.question_to_concept[qid] = concept
        
        if model_path and Path(model_path).exists():
            self.load_model(model_path)
    
    def load_model(self, model_path: str):
        """Load trained model from checkpoint."""
        checkpoint = torch.load(model_path, map_location=self.device)
        
        self.model = DKT(
            n_questions=checkpoint['n_questions'],
            embed_dim=checkpoint.get('embed_dim', 128),
            hidden_dim=checkpoint.get('hidden_dim', 128),
            n_layers=checkpoint.get('n_layers', 1),
            dropout=checkpoint.get('dropout', 0.2)
        )
        self.model.load_state_dict(checkpoint['model_state_dict'])
        self.model.to(self.device)
        self.model.eval()
        
        if 'concept_to_questions' in checkpoint:
            self.concept_to_questions = checkpoint['concept_to_questions']
            self.question_to_concept = {}
            for concept, qids in self.concept_to_questions.items():
                for qid in qids:
                    self.question_to_concept[qid] = concept
    
    def encode_sequence(self, attempts: List[Dict]) -> torch.Tensor:
        """
        Encode attempts into DKT input format.
        
        Args:
            attempts: list of dicts with 'question_id' and 'correct' keys
            
        Returns:
            tensor of shape (seq_len,) with encoded values
        """
        encoded = []
        for att in attempts:
            qid = att['question_id']
            correct = int(att['correct'])
            # Encoding: qid * 2 + correct (0 or 1)
            encoded.append(qid * 2 + correct)
        
        return torch.tensor(encoded, dtype=torch.long, device=self.device)
    
    def predict_mastery(self, attempts: List[Dict], 
                       return_question_probs: bool = False) -> Dict[str, float]:
        """
        Predict per-concept mastery from sequence of attempts.
        
        Args:
            attempts: list of dicts with 'question_id' and 'correct' keys
            return_question_probs: if True, also return per-question probabilities
            
        Returns:
            dict mapping concept -> mastery probability (0-1)
        """
        if not self.model:
            raise ValueError("Model not loaded. Call load_model() first.")
        
        if not attempts:
            return {}
        
        # Encode sequence
        x = self.encode_sequence(attempts).unsqueeze(0)  # (1, seq_len)
        
        # Predict
        with torch.no_grad():
            probs, _ = self.model(x)  # (1, seq_len, n_questions)
        
        # Take last timestep predictions
        last_probs = probs[0, -1, :].cpu().numpy()  # (n_questions,)
        
        # Aggregate by concept
        concept_mastery = {}
        for concept, qids in self.concept_to_questions.items():
            if qids:
                # Average probability over questions in this concept
                concept_probs = [last_probs[qid] for qid in qids 
                               if qid < len(last_probs)]
                if concept_probs:
                    concept_mastery[concept] = float(np.mean(concept_probs))
        
        if return_question_probs:
            return concept_mastery, last_probs.tolist()
        
        return concept_mastery
    
    def predict_next_question(self, attempts: List[Dict], 
                             next_question_id: int) -> float:
        """
        Predict probability of correctness for a specific next question.
        
        Args:
            attempts: sequence of past attempts
            next_question_id: ID of question to predict
            
        Returns:
            probability of correctness (0-1)
        """
        if not self.model or not attempts:
            return 0.5  # neutral prior
        
        x = self.encode_sequence(attempts).unsqueeze(0)
        
        with torch.no_grad():
            probs, _ = self.model(x)
        
        # Return probability for the specific question at last timestep
        prob = probs[0, -1, next_question_id].item()
        return float(prob)


def create_synthetic_data(n_students: int = 100, 
                         n_questions: int = 20,
                         seq_len_range: Tuple[int, int] = (10, 50),
                         seed: int = 42) -> List[Dict]:
    """
    Create synthetic student interaction sequences for training.
    
    Simulates students with varying ability levels attempting questions
    with varying difficulty.
    
    Returns:
        list of student sequences, each a dict with:
            - student_id: int
            - attempts: list of {'question_id': int, 'correct': bool}
    """
    np.random.seed(seed)
    
    # Simulate question difficulties (0-1, higher = harder)
    q_difficulty = np.random.beta(2, 5, n_questions)
    
    data = []
    
    for student_id in range(n_students):
        # Student ability (0-1, higher = more skilled)
        ability = np.random.beta(5, 2)
        
        # Sequence length
        seq_len = np.random.randint(seq_len_range[0], seq_len_range[1])
        
        attempts = []
        
        # Simulate learning curve (ability increases over time)
        for t in range(seq_len):
            # Select question (prefer questions near current ability)
            qid = np.random.choice(n_questions)
            
            # Probability of correctness based on ability vs difficulty
            # Add learning effect: ability increases by t/seq_len * 0.2
            current_ability = min(1.0, ability + (t / seq_len) * 0.2)
            prob_correct = 1 / (1 + np.exp(-5 * (current_ability - q_difficulty[qid])))
            
            correct = np.random.random() < prob_correct
            
            attempts.append({
                'question_id': qid,
                'correct': bool(correct)
            })
        
        data.append({
            'student_id': student_id,
            'attempts': attempts
        })
    
    return data


def train_dkt(data: List[Dict], n_questions: int, 
              epochs: int = 20, batch_size: int = 32,
              lr: float = 0.001, device: str = 'cpu',
              save_path: Optional[str] = None) -> DKT:
    """
    Train DKT model on student interaction data.
    
    Args:
        data: list of student sequences from create_synthetic_data()
        n_questions: total number of unique questions
        epochs: number of training epochs
        batch_size: batch size
        lr: learning rate
        device: 'cpu' or 'cuda'
        save_path: path to save model checkpoint
        
    Returns:
        trained DKT model
    """
    model = DKT(n_questions=n_questions).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.BCELoss()
    
    print(f"Training DKT with {len(data)} students, {n_questions} questions")
    
    for epoch in range(epochs):
        model.train()
        total_loss = 0
        n_batches = 0
        
        # Shuffle data
        np.random.shuffle(data)
        
        for i in range(0, len(data), batch_size):
            batch = data[i:i + batch_size]
            
            # Prepare batch
            batch_inputs = []
            batch_targets = []
            batch_masks = []
            max_len = max(len(s['attempts']) for s in batch)
            
            for student in batch:
                attempts = student['attempts']
                seq_len = len(attempts)
                
                # Input: encode all but last
                input_seq = [att['question_id'] * 2 + int(att['correct']) 
                           for att in attempts[:-1]]
                # Pad
                input_seq += [0] * (max_len - 1 - len(input_seq))
                batch_inputs.append(input_seq)
                
                # Target: one-hot of next question correctness
                target = np.zeros((max_len - 1, n_questions))
                mask = np.zeros(max_len - 1)
                
                for t in range(seq_len - 1):
                    qid = attempts[t + 1]['question_id']
                    correct = int(attempts[t + 1]['correct'])
                    target[t, qid] = correct
                    mask[t] = 1
                
                batch_targets.append(target)
                batch_masks.append(mask)
            
            # Convert to tensors
            x = torch.tensor(batch_inputs, dtype=torch.long, device=device)
            y = torch.tensor(batch_targets, dtype=torch.float32, device=device)
            mask = torch.tensor(batch_masks, dtype=torch.float32, device=device)
            
            # Forward
            optimizer.zero_grad()
            probs, _ = model(x)
            
            # Masked loss
            loss = criterion(probs * mask.unsqueeze(-1), y * mask.unsqueeze(-1))
            loss = loss / (mask.sum() + 1e-8)
            
            # Backward
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            
            total_loss += loss.item()
            n_batches += 1
        
        avg_loss = total_loss / n_batches
        print(f"Epoch {epoch + 1}/{epochs} - Loss: {avg_loss:.4f}")
    
    # Save model
    if save_path:
        torch.save({
            'model_state_dict': model.state_dict(),
            'n_questions': n_questions,
            'embed_dim': 128,
            'hidden_dim': 128,
            'n_layers': 1,
            'dropout': 0.2
        }, save_path)
        print(f"Model saved to {save_path}")
    
    return model

