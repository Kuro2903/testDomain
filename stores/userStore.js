import { defineStore } from "pinia"

export const useUserStore = defineStore("userStore", {
  state: () => ({
    userInfo: {},
    permissions: [],
    accessAll: false,
    import_file: {},
    import_pdf: {},
    import_docx: {},
  }),

  actions: {
    setUserInfo(value) {
      this.userInfo = value
    },
    setPermissions(access, permissions) {
      this.accessAll = access || false
      this.permissions = permissions
    },
    setPDFTemp(value) {
      this.import_pdf = value
    },
    setDocxTemp(value) {
      this.import_docx = value
    },
    login(userInfo) {
      this.userInfo = userInfo || {}
    },
    logOut() {
      this.userInfo = {}
      this.permissions = []
      this.accessAll = false
    },
    checkAuth() {
      if (useExpToken(this.userInfo.token)) return true
      return false
    },
  },

  persist: true,
})
