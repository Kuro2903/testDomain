import { defineStore } from "pinia"

export const usePageSetting = defineStore({
  id: "page-settng",
  state: () => ({
    setting: null,
    locale: null,
  }),
  getters: {
    getSetting() {
      return this.setting
    },
    getLocale() {
      return this.locale
    }
  },
  actions: {
    setSetting(page) {
      this.setting = page
    },
    setLocale(l) {
      this.locale = l
    }
  },
  persist: true,
})
