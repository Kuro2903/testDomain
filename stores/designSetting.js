import { defineStore } from "pinia"

const darkTheme = false
const appTheme = "#2d8cf0"
const appThemeList = [
  "#2d8cf0",
  "#0960bd",
  "#0084f4",
  "#009688",
  "#536dfe",
  "#ff5c93",
  "#ee4f12",
  "#0096c7",
  "#9c27b0",
  "#ff9800",
  "#FF3D68",
  "#00C1D4",
  "#71EFA3",
  "#171010",
  "#78DEC7",
  "#1768AC",
  "#FB9300",
  "#FC5404"
]

export const useDesignSettingStore = defineStore({
  id: "app-design-setting",
  state: () => ({
    darkTheme: false,
    appTheme,
    appThemeList
  }),
  getters: {
    getDarkTheme() {
      return this.darkTheme
    },
    getAppTheme() {
      return this.appTheme
    },
    getAppThemeList() {
      return this.appThemeList
    }
  },
  actions: {}
})
