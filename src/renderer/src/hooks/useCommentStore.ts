import { useState, useCallback } from 'react';
import type { ArtifactType } from '../types/index.js';

export interface CommentStore {
  comments: Map<ArtifactType, Map<string, string>>;
  setComment: (artifactType: ArtifactType, heading: string, text: string) => void;
  getComment: (artifactType: ArtifactType, heading: string) => string;
  hasAnyComments: () => boolean;
  clearAll: () => void;
}

export function useCommentStore(): CommentStore {
  const [comments, setComments] = useState<Map<ArtifactType, Map<string, string>>>(
    () => new Map(),
  );

  const setComment = useCallback((artifactType: ArtifactType, heading: string, text: string) => {
    setComments((prev) => {
      const next = new Map(prev);
      const sections = new Map(next.get(artifactType) ?? new Map());

      if (text.trim() === '') {
        sections.delete(heading);
        if (sections.size === 0) {
          next.delete(artifactType);
        } else {
          next.set(artifactType, sections);
        }
      } else {
        sections.set(heading, text);
        next.set(artifactType, sections);
      }

      return next;
    });
  }, []);

  const getComment = useCallback(
    (artifactType: ArtifactType, heading: string): string => {
      return comments.get(artifactType)?.get(heading) ?? '';
    },
    [comments],
  );

  const hasAnyComments = useCallback(
    (): boolean =>
      [...comments.values()].some((sections) =>
        [...sections.values()].some((t) => t.trim() !== ''),
      ),
    [comments],
  );

  const clearAll = useCallback(() => {
    setComments(new Map());
  }, []);

  return { comments, setComment, getComment, hasAnyComments, clearAll };
}
