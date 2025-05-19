const DEFAULT_CACHE_TIME = 60 * 60 * 24 * 7

/**
 * @param {string=} prefixKey -
 * @param {Object} [storage=localStorage] - sessionStorage | localStorage
 */
export const createStorage = ({
  prefixKey = "",
  storage = localStorage
} = {}) => {
  /**
   * @class Storage
   */
  const Storage = class {
    storage = storage
    prefixKey = prefixKey

    getKey(key) {
      return `${this.prefixKey}${key}`.toUpperCase()
    }

    /**
     * @description 
     * @param {string} key 
     * @param {*} value 
     * @param expire
     */
    set(key, value, expire = DEFAULT_CACHE_TIME) {
      const stringData = JSON.stringify({
        value,
        expire: expire !== null ? new Date().getTime() + expire * 1000 : null
      })
      this.storage.setItem(this.getKey(key), stringData)
    }

    /**
     * 读取缓存
     * @param {string} key 
     * @param {*=} def 
     */
    get(key, def = null) {
      const item = this.storage.getItem(this.getKey(key))
      if (item) {
        try {
          const data = JSON.parse(item)
          const { value, expire } = data
          
          if (expire === null || expire >= Date.now()) {
            return value
          }
          this.remove(key)
        } catch (e) {
          return def
        }
      }
      return def
    }

    /**
     * @param {string} key
     */
    remove(key) {
      this.storage.removeItem(this.getKey(key))
    }

    /**
     * @memberOf Cache
     */
    clear() {
      this.storage.clear()
    }

    /**
     * cookie
     * @param {string} name cookie 
     * @param {*} value cookie 
     * @param {number=} expire 
     * @example
     */
    setCookie(name, value, expire = DEFAULT_CACHE_TIME) {
      document.cookie = `${this.getKey(name)}=${value}; Max-Age=${expire}`
    }

    /**
     * @param name
     */
    getCookie(name) {
      const cookieArr = document.cookie.split("; ")
      for (let i = 0, length = cookieArr.length; i < length; i++) {
        const kv = cookieArr[i].split("=")
        if (kv[0] === this.getKey(name)) {
          return kv[1]
        }
      }
      return ""
    }

    /**
     * @param {string} key
     */
    removeCookie(key) {
      this.setCookie(key, 1, -1)
    }

    /**
     * cookie，cookie
     */
    clearCookie() {
      const keys = document.cookie.match(/[^ =;]+(?==)/g)
      if (keys) {
        for (let i = keys.length; i--; ) {
          document.cookie = keys[i] + "=0;expire=" + new Date(0).toUTCString()
        }
      }
    }
  }
  return new Storage()
}

export const storage = createStorage()

export default Storage
