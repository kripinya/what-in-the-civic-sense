import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const API_URL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl}/api`;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerUser = async (dob: string) => {
  const response = await api.post('/register', { dob });
  return response.data;
};

export const getUserConfig = async (userId: string) => {
  const response = await api.get(`/user/${userId}`);
  return response.data;
};

export const getMissions = async (level: number) => {
  const response = await api.get(`/missions?level=${level}`);
  return response.data;
};

export const updateScore = async (userId: string, missionId: string, scoresEarned: object) => {
  const response = await api.post('/score/update', {
    user_id: userId,
    mission_id: missionId,
    scores_earned: scoresEarned
  });
  return response.data;
};
