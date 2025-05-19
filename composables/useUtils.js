import { jwtDecode } from "jwt-decode"

const dayjs = useDayjs()

const FEDAULT_ALL = { page: 1, length: 9999, alphabetName: true }

export function useFormatNumberVN(number) {
  let newNumber = number

  if (!newNumber) return 0
  if (typeof newNumber === "string") newNumber = parseInt(newNumber)
  return newNumber.toLocaleString("vi-VN")
}

export function useFormatTime(date, format = "DD/MM/YYYY HH:mm:ss") {
  if (!date) return
  return dayjs(date).format(format)
}

export function useFormatHourMinute(timeString) {
  if (!timeString) return
  let parts = timeString.split(":")
  let hours = parts[0]
  let minutes = parts[1]
  return `${hours}:${minutes}`
}

export function removeInvalidValues(obj) {
  const validData = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null && value !== "") {
      validData[key] = value
    } else if (value === 0) {
      validData[key] = value
    }
  }
  return validData
}

export function useFormatTimeToHMS(time) {
  if (!time) return "00:00:00"

  let hours = Math.floor(time / 3600)
  let minutes = Math.floor((time - hours * 3600) / 60)
  let seconds = time - hours * 3600 - minutes * 60
  hours = ("0" + hours).slice(-2)
  minutes = ("0" + minutes).slice(-2)
  seconds = ("0" + seconds).slice(-2)

  return hours + ":" + minutes + ":" + seconds
}

export function useObjectHasValue(obj = {}) {
  return !!Object.values(obj).length
}

export function useAutoFitColumnWidth(sheetData, paddingX = 4, setCols = {}) {
  let objectMaxLength = []

  sheetData.map(title => {
    Object.entries(title).map(([, v], idx) => {
      let columnValue = v.toString()
      objectMaxLength[idx] = objectMaxLength[idx] >= columnValue.length ? objectMaxLength[idx] : columnValue.length
    })
  })

  const wscols = objectMaxLength.map((w, idx) => {
    const col = Object.keys(setCols).includes((idx + 1).toString()) ? (idx + 1).toString() : null
    return col ? { width: setCols[col] + paddingX } : { width: w + paddingX }
  })

  return wscols
}

export function useBranchLoader() {
  const { restAPI } = useApi()

  const options = ref({
    data: [],
    active: [],
    loading: false,
    page: 1,
    length: 20,
    total: 0,
  })

  const listDefault = ref([])

  const setDefaultOptions = (defaultOptions, pushToOptions = true) => {
    defaultOptions.forEach(defaultOption => {
      if (pushToOptions) options.value.data.push(defaultOption)

      listDefault.value.push(defaultOption)
    })
  }

  const handleScrollBranch = e => {
    const currentTarget = e.currentTarget
    if (currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight) {
      loadDataBranch()
    }
  }

  const loadDataBranch = async (alpha = true) => {
    options.value.loading = true
    if (!options.value.total || options.value.page * options.value.length < options.value.total + options.value.length) {
      let params = { page: options.value.page, length: options.value.length, alphabetName: alpha }
      const { data: resDataBranch, pending: loadingBranch } = await restAPI.cms.getBranches({
        params,
        cache: true,
      })
      if (resDataBranch.value?.status) {
        resDataBranch.value?.data?.data?.forEach(val => {
          const option = {
            label: val?.name,
            value: val?.id,
            disabled: !val?.is_active,
          }
          const isInListDefault = listDefault.value.some(opt => opt.value === option.value)
          if (!isInListDefault) {
            options.value.data.push(option)
          } else if (option.disabled) {
            const existingOption = options.value.data.find(opt => opt.value === option.value)
            if (existingOption) {
              existingOption.disabled = true
            }
          }
        })
        const elementToMove = options.value.data.find(item => item.value === 1)

        if (elementToMove) {
          let updatedItems = options.value.data.filter(item => item.value !== 1)
          updatedItems.sort((a, b) => a.label.localeCompare(b.label))
          updatedItems.unshift(elementToMove)
          options.value.data = updatedItems
        }
        options.value.active = options.value.data.filter(opt => !opt?.disabled || listDefault.value.some(option => opt.value === option.value)) || options.value.data
        options.value.total = resDataBranch.value?.data?.pagination?.total || 0
        options.value.page++
      }
    }
    options.value.loading = false
  }

  const loadActiveBranch = async () => {
    options.value.loading = true
    const { data } = await restAPI.cms.getBranches({ params: FEDAULT_ALL })
    options.value.loading = false

    if (!data?.value?.status) return

    options.value.data = []

    data.value.data.data.forEach(item => {
      if (item.is_active) {
        options.value.data.push({
          value: item.id,
          label: item.name,
        })
      }
    })
  }

  return {
    options,
    listDefault,
    handleScrollBranch,
    loadDataBranch,
    setDefaultOptions,
    loadActiveBranch,
  }
}

export function convertValue(origin) {
  switch (origin) {
    case 1:
      return true
    case 2:
      return false
    default:
      return null
  }
}
export function useCategoryLoader() {
  const { restAPI } = useApi()

  const options = ref({
    data: [],
    loading: false,
    page: 1,
    length: 20,
    total: 0,
  })

  const setDefaultOptions = defaultOptions => {
    defaultOptions.forEach(defaultOption => {
      options.value.data.push(defaultOption)
    })
  }

  const handleScrollCategories = e => {
    const currentTarget = e.currentTarget
    if (currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight) {
      loadDataCategories()
    }
  }

  const loadDataCategories = async () => {
    options.value.loading = true
    if (!options.value.total || options.value.page * options.value.length < options.value.total + options.value.length) {
      let params = { page: options.value.page, length: options.value.length, active: true }
      const { data: resDataBranch } = await restAPI.cms.getCategories({
        params,
      })
      if (resDataBranch.value?.status) {
        resDataBranch.value?.data?.categories?.forEach(val => {
          const option = {
            label: val?.name,
            value: val?.id,
          }

          if (!options.value.data.some(opt => opt.value === option.value)) {
            options.value.data.push(option)
          }
        })
        options.value.total = resDataBranch.value?.data?.pagination?.total || 0
        options.value.page++
      }
    }
    options.value.loading = false
  }

  return {
    options,
    handleScrollCategories,
    loadDataCategories,
    setDefaultOptions,
  }
}

export function useGetNumberLength(num) {
  const numStr = num.toString()
  if (numStr.includes("e")) {
    const [base, exponent] = numStr.split("e")
    const baseLength = base.replace(".", "").length
    const exponentValue = parseInt(exponent, 10)
    return baseLength + exponentValue
  } else {
    return numStr.replace(".", "").length
  }
}

export function useSubjectLoader() {
  const { restAPI } = useApi()

  const options = ref({
    data: [],
    active: [],
    loading: false,
    page: 1,
    length: 20,
    total: 0,
  })
  const listDefault = ref([])

  const setDefaultOptions = (defaultOptions, pushToOptions = true) => {
    defaultOptions.forEach(defaultOption => {
      if (pushToOptions) options.value.data.push(defaultOption)

      listDefault.value.push(defaultOption)
    })
  }

  const handleScrollSubject = e => {
    const currentTarget = e.currentTarget
    if (currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight) {
      loadDataSubject()
    }
  }

  const loadDataSubject = async () => {
    options.value.loading = true
    if (!options.value.total || options.value.page * options.value.length < options.value.total + options.value.length) {
      let params = { page: options.value.page, length: options.value.length }
      const { data: resData } = await restAPI.cms.getSubjects({
        params,
        cache: true,
      })
      if (resData.value?.status) {
        resData.value?.data?.subjects?.forEach(val => {
          const option = {
            label: val?.name,
            value: val?.id,
            disabled: !val?.is_active,
          }
          const isInListDefault = listDefault.value.some(opt => opt.value === option.value)
          if (!isInListDefault) {
            options.value.data.push(option)
          } else if (option.disabled) {
            const existingOption = options.value.data.find(opt => opt.value === option.value)
            if (existingOption) {
              existingOption.disabled = true
            }
          }
        })
        options.value.total = resData.value?.data?.pagination?.total || 0
        options.value.page++
        options.value.active = options.value.data.filter(opt => !opt?.disabled || listDefault.value.some(option => opt.value === option.value)) || options.value.data
      }
    }
    options.value.loading = false
  }

  const allActiveSubject = ref([])

  const loadAllActiveSubject = async () => {
    allActiveSubject.value = []

    options.value.loading = true

    const { data } = await restAPI.cms.getAllSubject({ params: { active: true } })

    if (!data?.value?.status) {
      options.value.loading = false
      return
    }

    data.value.data.forEach(subject => {
      allActiveSubject.value.push({
        label: subject.name,
        value: subject.id,
      })

      options.value.data.push({
        label: subject.name,
        value: subject.id,
      })
    })

    options.value.loading = false
  }

  const loadActiveSubject = async () => {
    options.value.loading = true
    const { data } = await restAPI.cms.getSubjects({ params: FEDAULT_ALL })
    options.value.loading = false

    if (!data?.value?.status) return

    options.value.data = []

    data.value.data.subjects.forEach(item => {
      if (item.is_active) {
        options.value.data.push({
          value: item.id,
          label: item.name,
        })
      }
    })
  }

  return {
    options,
    listDefault,
    handleScrollSubject,
    loadDataSubject,
    setDefaultOptions,
    allActiveSubject,
    loadAllActiveSubject,
    loadActiveSubject,
  }
}

export function createDaysOfWeek(t = null) {
  // if receive Error 'SyntaxError: Must be called at the top of a setup function' passing t as agrument
  return [
    { label: "Thứ 2", value: 1, disabled: false, checked: false },
    { label: "Thứ 3", value: 2, disabled: false, checked: false },
    { label: "Thứ 4", value: 3, disabled: false, checked: false },
    { label: "Thứ 5", value: 4, disabled: false, checked: false },
    { label: "Thứ 6", value: 5, disabled: false, checked: false },
    { label: "Thứ 7", value: 6, disabled: false, checked: false },
    { label: "Chủ nhật", value: 0, disabled: false, checked: false },
  ]
}

export function useTeacherLoader() {
  const { restAPI } = useApi()

  const options = ref({
    data: [],
    loading: false,
    length: 20,
    position: 1,
    page: 1,
    allBranch: true,
    active: true,
    total: 0,
  })

  const setDefaultOptions = defaultOptions => {
    defaultOptions.forEach(defaultOption => {
      options.value.data.push(defaultOption)
    })
  }

  const handleScrollTeachers = e => {
    const currentTarget = e.currentTarget
    if (currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight) {
      loadDataTeachers()
    }
  }

  const loadDataTeachers = async () => {
    options.value.loading = true
    if (!options.value.total || options.value.page * options.value.length < options.value.total + options.value.length) {
      let params = { length: options.value.length, position: options.value.position, active: options.value.active, allBranch: options.value.allBranch }
      const { data: resData } = await restAPI.cms.getStaff({
        params,
        cache: true,
      })
      if (resData.value?.status) {
        resData.value?.data?.data?.forEach(val => {
          const option = {
            label: val?.full_name,
            value: val?.id,
          }

          if (!options.value.data.some(opt => opt.value === option.value)) {
            options.value.data.push(option)
          }
        })
        options.value.total = resData.value?.data?.pagination?.total || 0
        options.value.page++
      }
    }
    options.value.loading = false
  }

  return {
    options,
    handleScrollTeachers,
    setDefaultOptions,
    loadDataTeachers,
  }
}

export function useExpToken(token) {
  try {
    const decoded = jwtDecode(token)
    const currentTime = Math.floor(Date.now() / 1000)

    if (decoded?.exp > currentTime) return true
    return false
  } catch {
    return false
  }
}

export function useCurriculumLoader() {
  const { restAPI } = useApi()

  const options = ref({
    data: [],
    loading: false,
    length: 20,
    page: 1,
    total: 0,
  })

  const listDefault = ref([])

  const setDefaultOptions = (defaultOptions, pushToOptions = true) => {
    defaultOptions.forEach(defaultOption => {
      if (pushToOptions) options.value.data.concat(defaultOption)

      listDefault.value.push(defaultOption)
    })
  }

  const handleScrollCurriculum = e => {
    const currentTarget = e.currentTarget
    if (currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight) {
      loadDataCurriculums()
    }
  }

  const loadDataCurriculums = async () => {
    options.value.loading = true
    if (!options.value.total || options.value.page * options.value.length < options.value.total + options.value.length) {
      let params = { length: options.value.length, page: options.value.page }
      const { data: resData } = await restAPI.cms.getLearnProgram({
        params,
        cache: true,
      })
      if (resData.value?.status) {
        resData.value?.data?.data?.forEach(val => {
          const option = {
            label: val?.name,
            value: val?.id,
            disabled: !val?.is_active,
            subjects: val.subjects?.map(x => x.id),
          }

          if (!options.value.data.some(opt => opt.value === option.value)) {
            options.value.data.push(option)
          }
        })
        options.value.total = resData.value?.data?.pagination?.total || 0
        options.value.page++
      }
    }
    options.value.loading = false
  }

  const loadActiveCurriculums = async () => {
    options.value.loading = true
    const { data } = await restAPI.cms.getLearnProgram({ params: FEDAULT_ALL })
    options.value.loading = false

    if (!data?.value?.status) return

    options.value.data = []

    data.value.data.data.forEach(item => {
      if (item.is_active) {
        options.value.data.push({
          value: item.id,
          label: item.name,
          subjects: item.subjects?.map(x => x.id),
        })
      }
    })
  }

  return {
    options,
    listDefault,
    handleScrollCurriculum,
    loadDataCurriculums,
    setDefaultOptions,
    loadActiveCurriculums,
  }
}

export function useClassroomLoader() {
  const { restAPI } = useApi()

  const options = ref({
    data: [],
    loading: false,
    length: 20,
    page: 1,
    total: 0,
  })

  const setDefaultOptions = defaultOptions => {
    defaultOptions.forEach(defaultOption => {
      options.value.data.push(defaultOption)
    })
  }

  const handleScrollClassroom = e => {
    const currentTarget = e.currentTarget
    if (currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight) {
      loadDataClassrooms()
    }
  }

  const loadDataClassrooms = async () => {
    options.value.loading = true
    if (!options.value.total || options.value.page * options.value.length < options.value.total + options.value.length) {
      let params = { length: options.value.length, page: options.value.page }
      const { data: resData } = await restAPI.cms.getClassroom({
        params,
        cache: true,
      })
      if (resData.value?.status) {
        resData.value?.data?.data?.forEach(val => {
          const option = {
            label: val?.name,
            value: val?.id,
            active: val?.is_active,
            disabled: !val?.is_active,
            branch_id: val?.branch_id,
            is_online: val?.is_online,
          }

          if (!options.value.data.some(opt => opt.value === option.value)) {
            options.value.data.push(option)
          }
        })
        options.value.total = resData.value?.data?.pagination?.total || 0
        options.value.page++
      }
    }
    options.value.loading = false
  }

  return {
    options,
    handleScrollClassroom,
    loadDataClassrooms,
    setDefaultOptions,
  }
}

export function containsCharacterAndNumberOnly(value) {
  const regex = /[!@#$%^&*(),.?":{}|<>]/
  if (!regex.test(value)) {
    return true
  }
  return false
}

export function useListenComboKey(comboKey = [], callback = () => {}, type = "keyup") {
  let keysPressed = {}

  const handle = event => {
    if (event.type != type) return
    const lowerKey = event.key.toLowerCase()

    if (type == "keyup") keysPressed[lowerKey] = event.type !== "keydown"
    else keysPressed[lowerKey] = event.type === "keydown"

    if (comboKey.every(key => keysPressed[key])) {
      event.preventDefault()
      callback(comboKey)
      keysPressed = {}
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handle)
    window.addEventListener("keyup", handle)
  })
  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handle)
    window.removeEventListener("keyup", handle)
  })
}

export function checkPermission(key, action) {
  const userStore = useUserStore()

  if (userStore.accessAll) return true

  const mergeArrayByLevel = (arr, level) => {
    if (level > arr.length) return arr.join("/dashboard")
    return arr.slice(0, level).join("/dashboard")
  }

  const findElementByKey = key => {
    const findItem = (data, key) => data?.find(item => item.key === key) || null

    const path = key.split("/dashboard")
    let k = mergeArrayByLevel(path, 1)
    let found = userStore.permissions?.find(item => item.key === k) || null

    if (found?.key !== key) {
      found = findItem(found?.listLevel1, key)
    }
    return found
  }

  const element = findElementByKey(key)
  if (element) {
    return element?.listLevel1?.some(e => e?.action === action && e?.checked) || element?.listLevel2?.some(e => e?.action === action && e?.checked)
  }
  return false
}

export function roleCheck() {
  const userStore = useUserStore()
  const { position, role_id } = userStore.userInfo
  if (role_id === ROLE_ID.STUDENT) return ROLE.STUDENT

  if (role_id <= ROLE_ID.CENTER_ADMIN) return ROLE.ADMIN

  if (role_id === ROLE_ID.CENTER_HR) return ROLE.ADMIN

  if (position === POSITION.NONE_POSITION) return ROLE.ADMIN

  if (position === POSITION.TEACHER || position === POSITION.TEACHING_ASSISTANT) return ROLE.TEACHER
}
