export async function registerStudent(payload) {
  const { data } = await axiosClient.post("/register", payload);
  return data;
}
