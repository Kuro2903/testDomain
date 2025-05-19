import { defineStore } from "pinia"
const projectSetting = {
  navMode: "vertical",
  navTheme: "light",
  isMobile: false,
  headerSetting: {
    bgColor: "#fff",
    fixed: true,
    isReload: true
  },
  showFooter: true,
  multiTabsSetting: {
    bgColor: "#fff",
    show: true,
    fixed: true
  },
  menuSetting: {
    minMenuWidth: 64,
    menuWidth: 250,
    fixed: true,
    mixMenu: false,
    mobileWidth: 1023,
    collapsed: false
  },
  crumbsSetting: {
    show: true,
    showIcon: false
  },
  permissionMode: "FIXED",
  isPageAnimate: true,
  pageAnimateType: "zoom-fade"
}
const {
  navMode,
  navTheme,
  isMobile,
  headerSetting,
  showFooter,
  menuSetting,
  multiTabsSetting,
  crumbsSetting,
  permissionMode,
  isPageAnimate,
  pageAnimateType
} = projectSetting

export const useProjectSettingStore = defineStore({
  id: "app-project-setting",
  state: () => ({
    navMode: navMode,
    navTheme,
    isMobile,
    headerSetting,
    showFooter,
    menuSetting,
    multiTabsSetting,
    crumbsSetting,
    permissionMode,
    isPageAnimate,
    pageAnimateType
  }),
  getters: {
    getNavMode() {
      return this.navMode
    },
    getNavTheme() {
      return this.navTheme
    },
    getIsMobile() {
      return this.isMobile
    },
    getHeaderSetting() {
      return this.headerSetting
    },
    getShowFooter() {
      return this.showFooter
    },
    getMenuSetting() {
      return this.menuSetting
    },
    getMultiTabsSetting() {
      return this.multiTabsSetting
    },
    getCrumbsSetting() {
      return this.multiTabsSetting
    },
    getPermissionMode() {
      return this.permissionMode
    },
    getIsPageAnimate() {
      return this.isPageAnimate
    },
    getPageAnimateType() {
      return this.pageAnimateType
    }
  },
  actions: {
    setNavTheme(value) {
      this.navTheme = value
    },
    setIsMobile(value) {
      this.isMobile = value
    }
  }
})
