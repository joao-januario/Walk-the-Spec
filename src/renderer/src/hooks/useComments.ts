import { useState, useEffect, useCallback } from 'react';
import type { Comment, ArtifactType } from '../types/index.js';
import * as api from '../services/api.js';

export function useComments(projectId: string | null, artifactType: ArtifactType | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!projectId || !artifactType) { setComments([]); return; }
    setLoading(true);
    try {
      const data = await api.getComments(projectId, artifactType);
      setComments(data.comments);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, artifactType]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const add = async (elementId: string, content: string) => {
    if (!projectId || !artifactType) return;
    const comment = await api.addComment(projectId, artifactType, elementId, content);
    setComments((prev) => [...prev, comment]);
    return comment;
  };

  const update = async (commentId: string, content: string) => {
    if (!projectId || !artifactType) return;
    const updated = await api.updateComment(projectId, artifactType, commentId, content);
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c)));
  };

  const remove = async (commentId: string) => {
    if (!projectId || !artifactType) return;
    await api.deleteComment(projectId, artifactType, commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  return { comments, loading, refetch: fetchComments, add, update, remove };
}
