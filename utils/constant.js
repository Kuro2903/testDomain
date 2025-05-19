export const PERMISSION_CODE = {
  MENU_EXAM: "menu/exam",
  MENU_SUPERADMIN: "menu/superadmin",
  MENU_MSCHOOL: "menu/mschool",
  MENU_QLTV: "menu/qltv",
  MENU_CAMBRIDGE: "menu/cambridge",
  MENU_BANKEXAM: "menu/bankexam",

  DASHBOARD: "dashboard",
  SUPER_ADMIN: "users",
  PERMISSIONS_ADMIN: "permissions",
  GROUPS_ADMIN: "groups",
  MSCHOOL_SITE_MANAGEMENT: "mschool/site-management/site-management",
  MSCHOOL_SETTING_PACKAGE_MANAGEMENT: "mschool/setting/package-management",
  MSCHOOL_DASHBOARD: "mschool/dashboard",
  MSCHOOL_CUSTOMER_SUPPORT: "mschool/support-management",
  MSCHOOL_STATISTICAL_LIVECLASS: "mschool/statistical-management/liveclass",
  MSCHOOL_STATISTICAL_TESTROOM: "mschool/statistical-management/testroom",
  MSCHOOL_STATISTICAL_SCHOOL: "mschool/statistical-management/school",
  MSCHOOL_TKB_MANAGEMENT_CUSTOMER: "mschool/tkb-management/customer",
  QLTV_SITE_MANAGEMENT: "qltv/site-management/site-management",
  EXAM_DASHBOARD: "exam/dashboard",
  EXAM_USER: "exam/user",
  EXAM_STATISTICAL_EXAM: "exam/statistical-management/exam",
  EXAM_STATISTICAL_ROOM: "exam/statistical-management/room",
  EXAM_STATISTICAL_USER: "exam/statistical-management/user",

  CAMBRIDGE_DASHBOARD: "cambridge/dashboard",
  CAMBRIDGE_ENDUSER: "cambridge/enduser",
  CAMBRIDGE_SETTING_TIME: "cambridge/setting/time",

  BANKEXAM_DASHBOARD: "bankexam/dashboard",
  BANKEXAM_USERS_ALL: "bankexam/users-management/users-all",
  BANKEXAM_USERS_ONLINE: "bankexam/users-management/users-online",
  BANKEXAM_STATISTICAL_UNIT: "bankexam/statistical-management/unit",
  BANKEXAM_STATISTICAL_SYSTEM: "bankexam/statistical-management/system",
  BANKEXAM_TYPE_UNIT: "bankexam/unit-management/type",
  BANKEXAM_LIST_UNIT: "bankexam/unit-management/list",
  BANKEXAM_LIST_SUBJECT: "bankexam/subject-management/list",
  BANKEXAM_GROUP_SUBJECT: "bankexam/subject-management/group",
  BANKEXAM_INFO_SETTING: "bankexam/setting-management/info",
  BANKEXAM_TUTORIAL_SETTING: "bankexam/setting-management/tutorial",
}

export const PERMISSION_CODE_EX = {
  DASHBOARD: "dashboard",
  DASHBOARD_QLTV: "dashboard_qltv",
}

export const PERMISSION_ACTION = {
  VIEW: "get",
  EDIT: "put",
  DELETE: "delete",
  ADD: "post",
}

export const ROLE_ID = {
  ROOT: 1,
  CENTER_OWNER: 2,
  CENTER_ADMIN: 3,
  CENTER_HR: 4, // Nhân sự
  STUDENT: 5, // Học viên
}

export const POSITION = {
  TEACHER: 1, //Giảng viên
  TEACHING_ASSISTANT: 2, //Trợ giảng
  NONE_POSITION: 3,
}

export const DASHBOARD_API_TYPE = {
  BRANCH: "branch",
  CURRICULUMN: "curriculum",
  CLASS_TYPE: "classType",
  CLASS_SUBJECT: "classSubject",
  NUMBER_CLASS: "numberClass",
  // student role
  ATTENDANCE_BY_STUDENT: "attendanceByStudent",
  EXAM_BY_STUDENT: "examByStudent",
  EXAM_BY_TEACHER: "examByTeacher",
  MY_CLASS: "myClass",
  CLASS_STATUS: "classStatus",
}
// export const TYPE_WEBSITE = {
//   K12: 2,
//   EDUCATION_FREE: 1,
//   ENTERPRISE: 3,
//   UNIVERSITY: 4,
// };
// export const TYPE_WEBSITE_ALL = 0;

// export const FUNCTION_SITE = {
//   MOOCS: 1,
//   TKB: 2,
//   SCHEDULE: 3,
// };

// export const STATUS_SITE_MSCHOOL = {
//   ACTIVE: 1,
//   NOTACTIVE: 2,
//   CANCEL: 3,
// };

// export const STATUS_PACKAGE_MSCHOOL = {
//   PUBLIC: 1,
//   PRIVATE: 2,
// };

// export const TYPE_PACKAGE_SERVICE_MSCHOOL = {
//   FREE: "free",
// };

// export const TYPE_SERVICE_MSCHOOL = {
//   MEETING: "meeting",
//   LMS: "lms",
//   LIVE: "live",
// };

// export const PRICE_SERVICE_MSCHOOL = {
//   FREE: 0,
//   NOTFREE: 1,
// };

// export const SITE_LEVEL_MSCHOOL = {
//   LEVEL1: 1,
//   LEVEL2: 2,
// };

// export const STATUS_ACCOUNT_MSCHOOL = {
//   ACTIVE: 1,
//   NOTACTIVE: 0,
//   CANCEL: 2,
// };

// export const ROLE_ACCOUNT_MSCHOOL = {
//   ADMIN: "owner",
//   STUDENT: "student",
//   TEACHER: "teacher",
// };

// export const STATUS_LIVE_CLASS_MSCHOOL = {
//   OPEN_PENDING: 1,
//   NO_START: 2,
//   END: 3,
//   CANCEL: 4,
// };

// export const STATUS_ROOM_MSCHOOL = {
//   OPEN: 1,
//   NOTOPEN: 2,
// };

// export const STATISTICAL_SCHOOL_DETAIL_MSCHOOL = {
//   TEACHER: "teacher",
//   GROUP: "group",
//   STUDENT: "student",
//   COURSES: "courses",
//   CLASS: "class",
// };

// export const idDevice = "hoanganh2512";

// export const IS_BLOCKED_QLTV = {
//   BLOCKED: true,
//   NOT_BLOCKED: false,
// };

// export const IS_BLOCKED_QLTV_INT = {
//   BLOCKED: 1,
//   NOT_BLOCKED: 0,
// };

// export const TYPE_SITE_QLTV = {
//   SCHOOL: 0,
//   EDU_DEPARTMENT: 1,
//   EDUCATION: 2,
// };

// export const STATUS_TKB = {
//   ALL: 0,
//   NEAR_EXPRIED: 1,
//   PENDING: 2,
//   EXPRIED: 3,
// };

// export const EXAMINATION_FILTER = "baitap";

// export const STATUS_USER_EXAMINATION = {
//   ACTIVE: true,
//   NOTACTIVE: false,
// };

// export const STATUS_USER_INT_EXAMINATION = {
//   ACTIVE: 1,
//   NOTACTIVE: 0,
// };

// export const GENDER_USER_EXAMINATION = {
//   MALE: "male",
//   FEMALE: "female",
// };

// export const STATISTICAL_DATE_EXAMINATION = {
//   LASTWEEK: "LASTWEEK",
//   LASTMONTH: "LASTMONTH",
// };

// export const STATUS_EXAM_EXAMINATION = {
//   PRIVATE: "private",
//   GLOBAL_PUBLIC: "global_public",
// };

// export const CHART_EXAM_EXAMINATION = {
//   BY_HAND: "by_hand",
//   IMPORT_PDF: "import_pdf",
//   FOLDER: "folder",
//   IMPORT_DOCX: "import_docx",
//   BY_TOPICS: "by_topics",
//   IMPORT_FILE: "import_file",
// };

// export const STATUS_ROOM_EXAMINATION = {
//   PENDING: "pending",
//   PROCESSING: "processing",
//   FINISH: "finish",
//   CANCEL: "cancel",
//   ALWAYS: "always",
// };

// export const TYPE_ACCOUNT_CAMBRIDGE = {
//   STARTERS: "Starters",
//   MOVERS: "Movers",
//   FLYERS: "Flyers",
//   NONE: "None",
// };

// export const STATUS_BANKEXAM = {
//   ACTIVE: "active",
//   INACTIVE: "inactive",
// };

// export const TYPE_ACCOUNT_BANKEXAM = {
//   USER: "user",
//   ADMIN: "admin",
// };

// export const GENDER_USER_BANKEXAM = {
//   MALE: "male",
//   FEMALE: "female",
// };

export const LIST_COLOR = ["#5B8C00", "#F5222D", "#FA8C16", "#9254DE", "#216d14", "#dc44db", "#177bad", "#225c4c", "#56919e", "#36c8ee", "#a39d21"]

export const LIST_OF_ARTICLE_CATEGORIES = {
  CATEGORY: "categories",
  NEWS: "news",
}

export const LIST_LANDING_PAGE = {
  LANDINGPAGE: "landing_page",
  INTROMOBIEDU: "intro_mobiedu",
}

export const LIST_SUPPORTS = {
  LIST_QUESTIONS: "list_questions",
  QUESTION_SUPPORT: "question_support",
}

export const LIST_SOLUTION = {
  GROUP_SOLUTION: "group_solution",
  SOLUTION: "solution",
}
export const LIST_INFO_USER = {
  INFO_USER: "Thông thin khách hàng",
  INFO_ORDER: "Thông tin đơn hàng",
  HISTORY_LOGIN: "Lịch sử đăng nhập",
  HISTORY_LEARN: "Lịch sử học",
  COMPLETION_COURSE: "Mức độ hoàn thành khóa học",
}

export const DOMAIN_MOBIEDU = "https://mobiedu.vn/cskh/"

export const IFRAME_CSKH = {
  CSKH_USER: "CSKH_USER",
  CSKH_DANG_KY: "CSKH_DANG_KY",
  CSKH_TRU_CUOC: "CSKH_TRU_CUOC",
  CSKH_MO_MT: "CSKH_MO_MT",
  CSKH_OTP_LOG: "CSKH_OTP_LOG",
  CSKH_MOMO: "CSKH_MOMO",
  CSKH_ONEPAY: "CSKH_ONEPAY",
}

export const IFRAME_CAMPAIGN_SMS = {
  CDTT_MEDIA: "CDTT_MEDIA",
  CDTT_REPORT_SEND_MT: "CDTT_REPORT_SEND_MT",
  CDTT_SEARCH_MT: "CDTT_SEARCH_MT",
}

export const IFRAME_CAMPAIGN_CHANNEL = {
  IFRAME_STASTS: "IFRAME_STASTS",
  IFRAME_STASTS_REVENUES: "IFRAME_STASTS_REVENUES",
  IFRAME_STASTS_REVENUES_BY_CP: "IFRAME_STASTS_REVENUES_BY_CP",
  IFRAME_STASTS_REVENUES_BY_PKG: "IFRAME_STASTS_REVENUES_BY_PKG",
  IFRAME_STASTS_CONTENT: "IFRAME_STASTS_CONTENT",
}

export const IFRAME_CAMPAIGN_PROMOTION_MOBIFONE = {
  IFRAME_KM_CTKM: "IFRAME_KM_CTKM",
  IFRAME_KM_ADD_CTKM: "IFRAME_KM_ADD_CTKM",
  IFRAME_KM_USER_CTKM_REPORT: "IFRAME_KM_USER_CTKM_REPORT",
  IFRAME_KM_USER_CTKM: "IFRAME_KM_USER_CTKM",
  IFRAME_KM_USER_CTKM_TOPUP: "IFRAME_KM_USER_CTKM_TOPUP",
  IFRAME_KM_ADD_USER_CTKM_TOPUP: "IFRAME_KM_ADD_USER_CTKM_TOPUP",
}

export const LINK_IFRAME_CSKH = {
  CSKH_USER: "frame/cskh/user?token=",
  CSKH_DANG_KY: "frame/cskh/dangky?token=",
  CSKH_TRU_CUOC: "frame/cskh/trucuoc?token=",
  CSKH_MO_MT: "frame/cskh/mo_mt?token=",
  CSKH_OTP_LOG: "frame/otpLog?token=",
  CSKH_MOMO: "frame/cskhMomo?token=",
  CSKH_ONEPAY: "frame/cskhOnepay?token=",
}

export const LINK_IFRAME_CAMPAIGN_SMS = {
  CDTT_MEDIA: "frame/scheduleSendContent/listSchedule?token=",
  CDTT_REPORT_SEND_MT: "frame/scheduleSendContent/reportSendMT?token=",
  CDTT_SEARCH_MT: "frame/scheduleSendContent/searchMT?token=",
}

export const LINK_IFRAME_CAMPAIGN_CHANNEL = {
  IFRAME_STASTS: "frame/stats?token=",
  IFRAME_STASTS_REVENUES: "frame/stats/revenues?token=",
  IFRAME_STASTS_REVENUES_BY_CP: "frame/stats/revenues_by_cp?token=",
  IFRAME_STASTS_REVENUES_BY_PKG: "frame/stats/revenues_by_pkg?token=",
  IFRAME_STASTS_CONTENT: "frame/stats/contents?token=",
}

export const LINK_IFRAME_CAMPAIGN_PROMITION_MOBIFONE = {
  IFRAME_KM_CTKM: "frame/ctkm?token=",
  IFRAME_KM_ADD_CTKM: "frame/ctkm/add?token=",
  IFRAME_KM_USER_CTKM_REPORT: "frame/user-promotion/report?token=",
  IFRAME_KM_USER_CTKM: "frame/user-promotion?token=",
  IFRAME_KM_USER_CTKM_TOPUP: "frame/user-promotion-topup?token=",
  IFRAME_KM_ADD_USER_CTKM_TOPUP: "frame/user-promotion-topup/addFile?token=",
}

export const LINK_IFRAME_SENT_MT = "frame/scheduleSendContent/sendMT?token="

export const IFRAME_REVENUE = {
  GENERAL_REVENUE: "GENERAL_REVENUE",
  REVENUE: "REVENUE",
  RETAIL_REPORT: "RETAIL_REPORT",
}

export const LINK_IFRAME_REVENUE = {
  GENERAL_REVENUE: "frame/generalRevenue?token=",
  REVENUE: "frame/revenue?token=",
  RETAIL_REPORT: "frame/retailReport?token=",
}

export const IFRAME_CONTROL_REVENUE = {
  REVENUE_ONEPAY: "REVENUE_ONEPAY",
  REVENUE_MOMO: "REVENUE_MOMO",
  IFRAME_PAY_STATIC_REPORT: "IFRAME_PAY_STATIC_REPORT",
  IFRAME_PAY_TRANSACTION_REPORT: "IFRAME_PAY_TRANSACTION_REPORT",
  IFRAME_PAY_CP_REPORT: "IFRAME_PAY_CP_REPORT",
  IFRAME_PAY_REFUND: "IFRAME_PAY_REFUND",
  IFRAME_PAY_MOMO_STATISTIC_REPORT: "IFRAME_PAY_MOMO_STATISTIC_REPORT",
  IFRAME_PAY_MOMO_TRANSACTION_REPORT: "IFRAME_PAY_MOMO_TRANSACTION_REPORT",
  IFRAME_PAY_MOMO_REPORT: "IFRAME_PAY_MOMO_REPORT",
}

export const LINK_IFRAME_CONTROL_REVENUE = {
  IFRAME_PAY_STATIC_REPORT: "frame/payStatisticReport?token=",
  IFRAME_PAY_TRANSACTION_REPORT: "frame/payTransactionReport?token=",
  IFRAME_PAY_CP_REPORT: "frame/payCpReport?token=",
  IFRAME_PAY_REFUND: "frame/payRefund?token=",

  IFRAME_PAY_MOMO_STATISTIC_REPORT: "frame/payMomoStatisticReport?token=",
  IFRAME_PAY_MOMO_TRANSACTION_REPORT: "frame/payMomoTransactionReport?token=",
  IFRAME_PAY_MOMO_REPORT: "frame/payMomoCpReport?token=",
}

export const STATUS_CMS_MOBIEDU = {
  ACTIVE: "display",
  INACTIVE: "hidden",
}

export const PAGE_SHOW_CMS_MOBIEDU = {
  HOME_PAGE: 1 << 1,
  COURSE_PAGE: 1 << 2,
  EXAM_GATE_PAGE: 1 << 3,
  MYCOURSE: 1 << 4,
  INTRO_PAGE: 1 << 5,
  ERROR_PAGE: 1 << 6,
  PAGE_FOOTER: 1 << 7,

  HOME_PARENT_PAGE: 1 << 8,
  HOME_PRESS_PAGE: 1 << 9,
  SOLUTION_PAGE: 1 << 10,
  SOLUTION_DETAIL_PAGE: 1 << 11,
  TEACHER_PAGE: 1 << 12,

  POD_PAGE: 1 << 13,
  BANNER_COMBO_COURSE_PAGE: 1 << 14,
  POPUP_HOME_PAGE: 1 << 15,
  HOME_SOLUTION_PAGE: 1 << 16,
  //REGISTRATION_AND_PROMOTION : RP
  HOME_RP_MIDDLE_PAGE: 1 << 17,
  HOME_RP_BOTTOM_PAGE: 1 << 18,
  HOME_DIGITAL_CONVERSION_PAGE: 1 << 19,
  EXAM_GATE_BANNER_TOP_PAGE: 1 << 20,
  EXAM_GATE_BANNER_BOTTOM_PAGE: 1 << 21,
  NEWS_PAGE: 1 << 22,
  HASHTAG_PAGE: 1 << 23,
  PARTNER_HOME_PAGE: 1 << 24,
  PARTNER_INTRODUCTION_PAGE: 1 << 25,
  INTRO_PAGE_FOOTER: 1 << 26,
}

PAGE_SHOW_CMS_MOBIEDU.ALL_PAGE_FEEDBACK = PAGE_SHOW_CMS_MOBIEDU.HOME_PARENT_PAGE | PAGE_SHOW_CMS_MOBIEDU.HOME_PRESS_PAGE | PAGE_SHOW_CMS_MOBIEDU.SOLUTION_PAGE | PAGE_SHOW_CMS_MOBIEDU.SOLUTION_DETAIL_PAGE | PAGE_SHOW_CMS_MOBIEDU.TEACHER_PAGE

export const TYPE_SUBJECT_MOBIEDU = {
  FIELD: "field",
  TOPIC: "topic",
}

export const IS_HOT_MOBIEDU = {
  IS_HOT: 1,
  NOT_HOT: 0,
}

export const TYPE_CATEGORY_MOBIEDU = {
  COURSE: "course",
  POST: "post",
  SUPPORT: "support",
}

export const TYPE_CATEGORY_COURSE_MOBIEDU = {
  COURSE: "course",
}

export const TYPE_CATEGORY_POST_MOBIEDU = {
  BLOG: "blog",
  VIDEO: "video",
}
export const TYPE_CATEGORY_SUPPORT_MOBIEDU = {
  PRODUCT: "product",
  POLICY: "policy",
  GUIDE: "guide",
}

export const STATUS_SALE_MOBIEDU = {
  RETAIL: "retail",
  NORETAIL: "no_retail",
}

export const TYPE_COURSE_MOBIEDU = {
  RETAIL: "retail",
  NORETAIL: "no_retail",
  COMBO: "combo",
  API: "api",
}

export const UPLOAD_IMAGE_MOBIEDU = {
  THUMBNAIL: "thumbnail",
  BANNER: "banner",
  ICON: "icon",
  FOOTER: "footer",
  HOT: "hot",
  BENEFIT: "benefit",
  MISSION: "mission",
  ACHIEVEMENT: "achievement",
}

export const CONTENT_MOBIEDU = {
  SUITABLE_FOR: "suitable_for",
  INTRO: "intro",
  GUIDE: "guide",
}

export const FLATFORM_TYPE_MOBIEDU = {
  APP: "flatform_app",
  WEBSITE: "flatform_web",
  WEBSITEANDAPP: "flatform_web_app",
  CROSS: "platform_cross",
  NONE: "",
}

export const NUMBER_PREFIX_MOBILE = {
  ONE: "9285",
  TWO: "999",
}

export const PAYMENT_TYPE_MOBIEDU = {
  SMS: "sms",
  ONLINE: "online",
  SMS_ONLINE: "sms_online",
}

export const CYCLE_MOBIEDU = {
  DAY: 1,
  WEEK: 2,
  MONTH: 3,
  YEAR: 4,
  NONE: 5,
  DAY10: 6,
  DAY30: 7,
  DAY90: 8,
  DAY180: 9,
}

export const TYPE_POST_MOBIEDU = {
  POST: "post",
  EXAM_GATE: "exam_gate",
  SOLUTION: "solution",
  LANDING_PAGE: "landing_page",
  FEEDBACK: "feedback",
  INTRO: "intro",
}

export const TYPE_SUPPORT_MOBIEDU = {
  CUSTOMER: "customer",
}

export const TYPE_LESSON_MOBIEDU = {
  CATEGORY: "category",
  CONTENT: "content",
}

export const DEVICE_TYPE_MOBIEDU = {
  PC: "pc",
  MOBILE: "mobile",
}

export const MOBIEDU_FILTER = {
  DETAIL: "detail",
}

export const TYPE_PAGE_STRUCTURE_MOBIEDU = {
  FOOTER: "footer",
  HEADER: "header",
}

export const BANNER_STATUS_EXTEND = {
  DISPLAY_LOG_IN: "display_log_in",
  DISPLAY_LOG_OUT: "display_log_out",
}

export const TYPE_BANNER_MOBIEDU = {
  POPUP: "popup",
  BANNER: "banner",
}

export const TYPE_POPUP_MOBIEDU = {
  STATIC_CONTENT: "static",
  VIDEO_CONTENT: "video",
  POPUP_CONTENT: "popup",
}

export const USER_TYPE_MOBIEDU = {
  USER: "user",
  TEACHER: "teacher",
  CP: "cp",
  ADMIN: "admin",
}

export const TYPE_DATA_LESSON = {
  DOCUMENT: "document",
  NOTE: "note",
  DISCUSSION: "discussion",
}

export const TYPE_ERROR = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETE: "complete",
}

export const STATUS_ORDER = {
  PENDING: "pending",
  COMPLETE: "complete",
}

export const DOMAIN_DEFAULT = {
  NAME: ".codeinet.com",
}

export const TYPE_PROMOTION = {
  SAME_PRICE: "same_price",
  FIXED_PRICE: "fixed_price",
  PERCENTAGE: "percentage",
}

export const CUSTOMER_TYPE_PROMOTION = {
  ALL_USER: "all_user",
  USER_SUB: "user_sub",
  USER_ACTIVE: "user_active",
  USER_INACTIVE: "user_inactive",
}

export const CATEGORY_TYPE_PROMOTION = {
  PROMOTION_EXAM_GATE: "exam_gate",
  PROMOTION_COURSE: "course",
  PROMOTION_MOBIFONE: "mobifone",
  PROMOTION_OTHER: "other",
}

export const STATUS_CUSTOMER = {
  ACTIVE: "active",
  INACTIVE: "inactive",
}

export const ERROR_CODE = {
  ERROR_EMAIL_NOT_VERIFIED: 2008,
  ERROR_DUPLICATE_DATA: "ERROR_DUPLICATE_DATA",
  ERROR_CATEGORY_HAS_DATA_DEPENDENCY: "ERROR_CATEGORY_HAS_DATA_DEPENDENCY",
  ERROR_SUBJECT_EXISTS: "ERROR_SUBJECT_EXISTS",
}

export const SUBJECT_CONTENT_TYPE_ENUM = {
  YOUTUBE_TYPE: 1,
  VIDEO_TYPE: 2,
  PARAGRAPH_TYPE: 3,
  EXAM_TYPE: 4,
  DOCUMENT_TYPE: 5,
}

export const ERROR_CODES = {
  1000: "Lỗi dữ liệu đầu vào",
  1001: "Tạo dữ liệu lỗi",
  1002: "Lấy dữ liệu lỗi",
  1003: "Không có quyền thực hiện thao tác này",
  1004: "Cập nhật dữ liệu lỗi",
  1005: "Không tìm thấy dữ liệu",
  1006: "Xóa dữ liệu lỗi",
  1007: "Đăng ký thất bại",

  // User
  2000: "Email đã tồn tại",
  2001: "Số điện thoại đã tồn tại",
  2002: "Tên tài khoản đã tồn tại",
  2003: "Nhân sự đã được gán dữ liệu. Không thể chỉnh sửa.",
  2004: "Nhân sự đã được phân công giảng dạy. Không thể xóa.",

  // Auth
  2005: "Đăng nhập thất bại",
  2006: "Tài khoản không hoạt động",
  2007: "Lỗi gửi OTP",
  2008: "Tài khoản chưa xác thực email",
	// BillType - Loại phiếu thu
	2019: "Tên loại phiếu thu đã tồn tại.",
	2020: "Loại phiếu thu đã được áp dụng. Không thể xóa.",

  2021: "Tài liệu đã áp dụng trong bài giảng. Không thể chỉnh sửa",
  2022: "Tài liệu đã áp dụng trong bài giảng. Không thể xóa",

  2030: "Trung tâm đang dừng hoạt động",

  //Discount errors
  2023: "Mã giảm giá không tồn tại",
  2024: "Mã giảm giá không hợp lệ",
  2025: "Mã giảm giá không trong thời gian áp dụng",
  2026: "Mã giảm giá đang dừng hoạt động",
  2027: "Số lượng mã giảm giá đã hết",
  2028: "Mã giảm giá đã sử dụng",
  2029: "Học phí đã có phiếu thu. Không thể xóa",
	2030: "Trung tâm đang dừng hoạt động",

	// PaymentVoucherType - Loại phiếu chi
	2031: "Tên loại phiếu chi đã tồn tại.",

  // PaymentVoucherType - Loại phiếu chi
	2035: "Loại phiếu chi đã được áp dụng. Không thể xóa.",

  // Subject errors
  6000: "Môn học đã tồn tại",
  6001: "Đã có chương trình học của môn học. Không thể xóa",
  6002: "Đã có lớp của môn học. Không thể xóa",
  6003: "Môn học đã có học viên đăng ký. Không thể xóa",

  // Class errors
  6012: "Không tìm thấy lớp học",
  6013: "Tên lớp học là bắt buộc",
  6014: "Mã lớp học tối thiểu 20 kí tự",
  6015: "Mã lớp học tối thiểu 20 kí tự",
  6016: "Mã lớp học không hỗ trợ kí tự đặc biệt",
  6017: "Mô tả không hỗ trợ kí tự đặc biệt",
  6018: "Link nhóm học là bắt buộc",
  6019: "Mã lớp học đã tồn tại",
  6020: "Lớp học đã diễn ra nên không thể hủy lớp.",
  6021: "Cần chuyển học viên sang lớp khác",
  6022: "Lớp học bị trùng lịch với lịch học khác của học viên. Vui lòng chọn lớp học khác.",
  6023: "Lớp học chuyển đã có học viên trùng với lớp đang hủy",
  6024: "Lớp học đang diễn ra. Không thể chỉnh sửa.",
  6025: "Không thể cập nhật lớp học đã hủy hoặc đã kết thúc",
  6026: "Hủy lớp học thành công.",
  6027: "Lớp học bạn chọn đã trùng với lớp khác. Vui lòng chọn lớp học khác.",
  6028: "Học viên có lịch học trùng với lớp khác. Vui lòng chọn học viên khác hoặc xếp lịch học khác.",
  // Schedule class errors
  6036: "Thời gian bắt đầu không hợp lệ",
  6037: "Thời gian kết thúc không hợp lệ",
  6038: "Số buổi học trong lịch không bằng số buổi môn",
  6039: "Số buổi học trong nội dung bài giảng chưa đủ",
  6040: "Số buổi học không bằng số buổi lịch học",
  6041: "Ngày học không thể nhỏ hơn ngày khai giảng.",
  6042: "Lớp học đã điểm danh, không thể xếp lịch",
  6043: "Giảng viên có lịch bị trùng. Bạn vui lòng chọn giảng viên khác.",
  6044: "Trợ giảng có lịch bị trùng. Bạn vui lòng chọn trợ giảng khác.",
  6045: "Phòng học có lịch bị trùng. Bạn vui lòng chọn phòng học khác.",
  6046: "Ngày học bạn chọn trùng với ngày nghỉ của trung tâm. Vui lòng chọn lại ngày học khác.",
  6047: "Buổi học đã diễn ra. Không thể xóa",
  // Work session errors
  6048: "Tên ca làm đã tồn tại",
  6049: "Ca làm đã gán dữ liệu. Không thể chỉnh sửa.",

  // Lesson data errors
  6090: "Đã đạt số buổi học tối đa",
  6060: "Đường link youtube không hợp lệ",
  6061: "Nội dung đoạn văn không hợp lệ",
  6062: "Loại điểm không chính xác",
  6063: "Thời gian kết thúc không hợp lệ",
  6064: "Đường dẫn tài liệu không hợp lệ",
  6065: "Kiểu bài giảng không hợp lệ",
  6066: "Lỗi trong quá trình xử lý",
  6067: "Không tìm thấy nội dung bài giảng",
  6068: "Đề thi không tìm thấy",
  6069: "Ô dữ liệu không hỗ trợ ký tự đặc biệt.",
  6070: "Tên đề thi đã tồn tại. Vui lòng nhập tên khác",
  // Category errors
  6072: "Danh mục đã có dữ liệu thuộc. Không thể xóa",
  6073: "Danh mục đã có dữ liệu thuộc. Không thể xóa",
  6074: "Tên danh mục đã tồn tại",
  6075: "Không tìm thấy danh mục",
  6076: "Danh mục đang có môn học, Không thể xóa",
  // Teacher errors
  6084: "Không tìm thấy giảng viên",

  // Public data errors
  6096: "Bạn đã nhập quá 250 ký tự.",
  6097: "Thời gian bắt đầu phải nhỏ hơn thời gian kết thúc",
  6098: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
  6099: "Không có quyền truy cập",
  6100: "Dữ liệu không phù hợp",
  6101: "Không có quyền truy cập",
  6102: "Phòng học đã tồn tại.",
  6103: "Dữ liệu đã tồn tại",
  6104: "Lỗi hệ thống",
  6105: "Dữ liệu không phù hợp",
  6106: "Dữ liệu không phù hợp",

  //student errors
  ERROR_STUDENT_HAS_ASSIGNED: "Học viên đã có dữ liệu học. Không thể xóa",
  // Certificate errors
  6200: "Chứng chỉ đã được áp dụng. Không thể xóa",

  6800: "Kế hoạch tuyển sinh đã có học viên. Không thể xóa",

  // curriculum
  ERROR_CURRICULUM_EXISTED: "Chương trình học đã tồn tại",
  7000 : "Chương trình học đã gán cho học viên. Không thể xóa",
  // enrollment
  ERROR_ENROLLMENT_EXISTED: "Dữ liệu đã tồn tại",

  // ERROR_CAN_NOT_DELETE_ENROLLMENT_HAS_STUDENT: 6800,
}

export const MAX_VIDEO_FILE_SIZE_IN_GB = 3

export const COLOR = {
  BUTTON: {
    PRIMARY: "#00A2EB",
    PRIMARY_DARK: "#133D85",
    SUCCESS: "#00974E",
    INFO: "#133D85",
  },
}

export const CALENDAR_SCHEDULER_VALUE_TYPE = {
  DAY: "day",
  WEEK: "week",
  MONTH: "month",
}

export const SCHEDULER_OPTION_KEY = {
  ATTENDANCE: "attendance",
  SCHEDULE_ARRANGE: "schedule_arrange",
  LEAVE_ABSENCE: "leave_absence",
  REPORT: "report",
  BREAK: "break",
  REVERVE: "reserve",
}

export const CLASS_SCHEDULE_TYPE = {
  DAY: 1,
  WEEK: 2,
}

export const DEFAULT_UUID = "00000000-0000-0000-0000-000000000000"

export const CLASS_STATUS = {
  COMMING: 1,
  IN_PROGRESS: 2,
  FINISHED: 3,
  CANCELED: 4,
}

export const LESSON_DONE_TYPE = {
  TEST: 1,
  PROGRESS: 2,
}

export const LIVECLASS_SOFTWARE = {
  WINDOW: "window",
  MAC_INTEL: "mac_intel",
  MAC_M1: "mac_m1",
}

export const LIVECLASS_JOIN = {
  SOFTWARE: "software",
  BROWSER: "browser",
}

export const ROOM_TYPE = {
  GOOGLE_MEET: "Google Meet",
  ZOOM: "Zoom",
  LIVECLASS: "Live class",
}

export const EXAM_STATUS = {
  NOT_SUBMITTED: 1,
  SUBMITTED: 2,
  LATE_SUBMIT: 3,
}

export const EXAM_GRADE_STATUS = {
  DONE: "done",
  PROGRESS: "progress",
}

export const STUDENT_PROGRESS_STATUS = {
  UPCOMING: 1, // Sắp diễn ra
  INPROGRESS: 2, // Đang diễn ra
  ENDED: 3, // Đã kết thúc
  CLOSE: 4, // Đã hủy
}

export const STUDENT_PROGRESS_RESULT = {
  PASS: 1, //Qua môn,
  FAIL: 2, //Trượt môn
}

export const EXAM_RESULT_SCORE_BOARD = {
  FAIL: "2",
  PASS: "1",
}

export const NOTIFICATION_TYPE = {
  SCHEDULE_CLASS: "Xếp lịch học",
  STUDENT_CLASS: "Xếp lịch học học viên",
  TEST_RESULT: "Kết quả bài kiểm tra",
}

export const STUDENT_TYPE = {
  POTENTIAL: 1,
  CARETAKING: 2,
  RECARING: 3,
  OFFICIAL: 4,
  OLD: 5,
  TRIAL: 6,
}

export const EMAIL_REGEX = /^[a-zA-Z0-9]+(?:[._-]?[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/

export const SPECIAL_CHARS = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/

export const STUDENT_STATUS = {
  PENDING: 1,
  IN_PROGRESS: 2,
  RESERVED: 3,
  STOPPED: 4,
  COMPLETED: 5,
  WILL_ATTEND: 6,
  DONE: 7,
}

export const DISCOUNT_TYPE = {
  PERCENT: 1,
  MONEY: 2,
}

export const RECEIPT_STATUS = {
  PENDING: 1,
  CONFIRM: 2,
  CANCEL: 3,
}

export const DISCOUNT_STATUS = {
  COMING: 1,
  IN_PROGRESS: 2,
  FINISHED: 3,
  STOPPED: 5,
}

export const FILTER = {
  TOTAL: 1,
  REVENUE: 2,
  EXPENSE: 3,
}

export const PAY_OPTION = {
  BANKING: 1,
  CASH: 2,
  ONLINE_BANKING: 3,
}

export const LEARNING_TYPE = {
  ONLINE: 1,
  OFFLINE: 2,
  HYBRID: 3,
}

export const CERTIFICATE_STATUS = {
  NOT_CONFIRM: 1,
  CONFIRM: 2,
  DENY: 3,
  NOT_FULLFIL: 4,
}

export const TUITION_STATUS = {
  UNPAID: 0,
  PAID: 1,
  OVERDUE: 2,
  BAD_DEBT: 3
}

export const ROLE = {
  ADMIN: 'admin',
  STUDENT: 'student',
  TEACHER: 'teacher'
}

export const HELP_TYPE = {
  ABSENCE: 1,
  RESERVED: 2,
  STOP_STUDY: 3,
  OTHER: 4
}