import { useState, useEffect, useCallback } from 'react';
import type { Feature, Artifact, ArtifactType } from '../types/index.js';
import * as api from '../services/api.js';

export function useFeatureData(projectId: string | null) {
  const [feature, setFeature] = useState<Feature | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFeature = useCallback(async () => {
    if (!projectId) { setFeature(null); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFeature(projectId);
      setFeature(data);
    } catch (err: any) {
      setFeature(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchFeature(); }, [fetchFeature]);

  return { feature, loading, error, refetch: fetchFeature };
}

export function useArtifactData(projectId: string | null, artifactType: ArtifactType | null) {
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArtifact = useCallback(async () => {
    if (!projectId || !artifactType) { setArtifact(null); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getArtifact(projectId, artifactType);
      setArtifact(data);
    } catch (err: any) {
      setArtifact(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, artifactType]);

  useEffect(() => { fetchArtifact(); }, [fetchArtifact]);

  return { artifact, loading, error, refetch: fetchArtifact };
}
