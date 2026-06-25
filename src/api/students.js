import apiClient from './client';

// GET /students/ -> StudentRead[]
export async function listStudents(params = {}) {
  const { data } = await apiClient.get('/students/', { params });
  return data;
}

// POST /students/add -> StudentRead
export async function createStudent(payload) {
  const { data } = await apiClient.post('/students/add', payload);
  return data;
}

// PUT /students/{id} -> StudentRead
export async function updateStudent(id, payload) {
  const { data } = await apiClient.put(`/students/${id}`, payload);
  return data;
}

// DELETE /students/{id}
export async function deleteStudent(id) {
  const { data } = await apiClient.delete(`/students/${id}`);
  return data;
}
