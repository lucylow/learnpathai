/**
 * SemanticSearchWidget Component
 * Widget for semantic search of resources
 */

import React, { useState } from 'react';
import { Search, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useSemanticSearch } from '../../hooks/useSemanticSearch';

interface SemanticSearchWidgetProps {
  onResourceSelect?: (resourceId: string) => void;
}

export const SemanticSearchWidget: React.FC<SemanticSearchWidgetProps> = ({
  onResourceSelect,
}) => {
  const [query, setQuery] = useState('');
  const { results, loading, error, search } = useSemanticSearch();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search({ query: query.trim(), top_k: 5 });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-green-600';
    if (score >= 0.8) return 'text-blue-600';
    if (score >= 0.7) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <Card className="border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          <CardTitle>Semantic Search</CardTitle>
        </div>
        <CardDescription>
          Find resources by meaning, not just keywords
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to learn about?"
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-teal-600 hover:bg-teal-700"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-gray-600">Searching...</span>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900 text-sm">
              Top Results
            </h3>
            {results.map((result) => (
              <div
                key={result.resource_id}
                className="bg-white rounded-lg p-3 border border-teal-200 hover:border-teal-400 transition-colors cursor-pointer"
                onClick={() => onResourceSelect?.(result.resource_id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm">
                        {result.title}
                      </h4>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600">
                      Resource ID: {result.resource_id}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getScoreColor(result.score)}
                  >
                    {Math.round(result.score * 100)}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && results.length === 0 && query && (
          <div className="text-center py-6 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No results found</p>
            <p className="text-sm">Try a different search query</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SemanticSearchWidget;


