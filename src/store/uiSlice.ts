import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { DEFAULT_SYMBOL } from '../config/coins'

interface UiState {
  selectedSymbol: string
}

const initialState: UiState = { selectedSymbol: DEFAULT_SYMBOL }

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    coinSelected(state, action: PayloadAction<string>) {
      state.selectedSymbol = action.payload
    },
  },
})

export const { coinSelected } = uiSlice.actions
export default uiSlice.reducer
