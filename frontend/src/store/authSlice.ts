import { createSlice} from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';


// Định nghĩa kiểu dữ liệu User
interface User {
  id: string;
  fullName: string;
  picture: string;
  role: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Gọi hàm này khi có token/đăng nhập thành công
    setCredentials: (state, action: PayloadAction<User>) => {
      state.isLoggedIn = true;
      state.user = action.payload;
    },
    // Gọi hàm này khi click Đăng xuất
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      localStorage.clear(); // Dọn dẹp sạch sẽ LocalStorage
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;