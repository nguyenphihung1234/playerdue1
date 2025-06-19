import axios from './axiosConfig';

export const fetchPlayers = async () => {
  const res = await axios.get('/game-players');
  return res.data.data; // Truy cập vào `data` trong ApiResponse
};
export const getPlayerById = async (id) => {
  const res = await axios.get(`/game-players/${id}`);
  return res.data.data; // vì backend trả về { success, message, data }
};