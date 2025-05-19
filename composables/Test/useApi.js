import User from "~/Pages/user.vue";

const API_ENDPOINTS = {
  cms: {
    login: "/api/auth/login",
    admin_login: "/api/auth/login",
    forgot_password: "/api/auth/forgot",
    register: "/api/auth/register",
    verify_token: "/api/auth/verify_token",
    verify_email: "/api/auth/verify_email",
    resend_otp: "/api/auth/send-otp",
    unit_information: "/api/admin/center",
    reset_pass: "/api/auth/forgot",
    students: "/api/admin/students",
    study_need: "/api/admin/study-needs",
    list_study_need: "/api/admin/list-study-needs",
    provinces: "/api/admin/provinces",
    districts: "/api/admin/districts",
    branches: "/api/admin/branches",
    shift: "/api/admin/work-session",
    shifts: "/api/admin/work-sessions",
    staff: "/api/admin/users",
    category: "/api/admin/category",
    categories: "/api/admin/categories",
    subject: "/api/admin/subject",
    subjects: "/api/admin/subjects",
    all_subject: "/api/admin/subject/all",
    classes: "/api/admin/classes",
    cancel_class: "api/admin/class/cancel",
    User: "/api/admin/users",
    class: "/api/admin/class",
    permissionGroup: "/api/admin/permission-grp",
    permissionTag: "/api/admin/permission-tags",
    lessons: "/api/admin/lessons",
    lesson_data: "/api/admin/lesson-data",
    classrooms: "/api/admin/classrooms",
    classroom: "/api/admin/classroom",
    center: "/api/admin/center",
    schedule_class_student: "/api/admin/schedule-class/student",
  },
};

class Request {
  constructor() {
    const route = useRoute();
    this.baseURL = "http://localhost:3000";
    this.accessToken = `Bearer ${useUserStore()?.userInfo?.token}`;
    this.headers = {};
    this.handleFetch = {
      onRequest() {},
      onRequestError({ _, __, error }) {
        console.error("Request error: ", error.message);
      },
      onResponse() {},
      onResponseError({ _, response }) {
        if (response._data?.error === 6039) {
          const numberOfLectures = Number(response._data?.message);

          if (isNaN(numberOfLectures))
            return window["$message"].error("Unknown error");

          if (numberOfLectures > 0)
            return window["$message"].error(
              t(response._data?.error, {
                numberOfLectures: response._data?.message,
              }),
            );

          if (numberOfLectures < 0)
            return window["$message"].error(
              t("lectures.exceeded", {
                numberOfLectures: response._data?.message * -1,
              }),
            );
        }
        if (route.path.includes("profile")) return;
        if (response._data?.error === 2008) return;
        else
          window["$message"].error(
            ERROR_CODES[response._data?.error] || response._data?.message,
          );

        console.error("Response error: ", response._data?.message);

        if (response.status == 401 || response._data?.error === 6101)
          return navigateTo(window["$loginUrl"], { external: true });
      },
    };
  }

  fetch(url, method, options) {
    const headers = {
      "Content-type": "application/json",
      Authorization: this.accessToken,
    };

    return useFetch(url, {
      baseURL: this.baseURL,
      method,
      headers,
      ...options,
      // onResponse({ response }) {
      //   if (!response.ok) {
      //     message.error(`Error: ${response.statusText}`);
      //   }
      // },
    });
  }

  get(url, options) {
    return this.fetch(url, "GET", options);
  }
  post(url, options) {
    return this.fetch(url, "POST", options);
  }
  put(url, options) {
    return this.fetch(url, "PUT", options);
  }
  patch(url, options) {
    return this.fetch(url, "PATCH", options);
  }
  delete(url, options) {
    return this.fetch(url, "DELETE", options);
  }
}

class CMSManager {
  constructor(request) {
    this.request = request;
  }
  // Auth_____________________________________________________________________________________
  async login(data) {
    return this.request.post(API_ENDPOINTS.cms.login, data);
  }

  async adminLogin(data) {
    return this.request.post(API_ENDPOINTS.cms.admin_login, data);
  }

  async forgotPassword(data) {
    return this.request.post(API_ENDPOINTS.cms.forgot_password, data);
  }
  async register(data) {
    return this.request.post(API_ENDPOINTS.cms.register, data);
  }

  async verifyToken(data) {
    return this.request.post(API_ENDPOINTS.cms.verify_token, data);
  }

  async verifyEmail(data) {
    return this.request.post(API_ENDPOINTS.cms.verify_email, data);
  }

  async resendOtp(data) {
    return this.request.post(API_ENDPOINTS.cms.resend_otp, data);
  }
  //__________________________________________________________________________________________

  // user_____________________________________________________________________________________
  async getUser(data) {
    return this.request.get(API_ENDPOINTS.cms.User, data);
  }
  //__________________________________________________________________________________________

  //Unit______________________________________________________________________________________
  async getUnitInformation(data) {
    return this.request.get(API_ENDPOINTS.cms.unit_information, data);
  }
  async updateUnitInformation(data) {
    return this.request.put(API_ENDPOINTS.cms.unit_information, data);
  }
  //__________________________________________________________________________________________

  //Students__________________________________________________________________________________
  async getStudents(data) {
    return this.request.get(API_ENDPOINTS.cms.students, data);
  }
  async createStudent(data) {
    return this.request.post(API_ENDPOINTS.cms.students, data);
  }
  async getStudentDetail(data) {
    return this.request.get(`${API_ENDPOINTS.cms.students}/${data.id}`, data);
  }
  async updateStudent(data) {
    return this.request.put(`${API_ENDPOINTS.cms.students}/${data.id}`, data);
  }
  async deleteStudents(data) {
    return this.request.delete(API_ENDPOINTS.cms.students, data);
  }
  //__________________________________________________________________________________________

  //Study neesd_______________________________________________________________________________
  async createStudyNeed(data) {
    return this.request.post(API_ENDPOINTS.cms.study_need, data);
  }
  async getStudyNeedDetail(data) {
    return this.request.get(`${API_ENDPOINTS.cms.study_need}/${data.id}`, data);
  }
  async updateStudyNeed(data) {
    return this.request.put(`${API_ENDPOINTS.cms.study_need}/${data.id}`, data);
  }
  async listStudyNeed(data) {
    return this.request.get(API_ENDPOINTS.cms.list_study_need, data);
  }
  async deleteStudyNeed(data) {
    return this.request.delete(
      `${API_ENDPOINTS.cms.study_need}/${data.id}`,
      data,
    );
  }
  //__________________________________________________________________________________________

  // Staff____________________________________________________________________________________
  async getStaff(data) {
    return this.request.get(API_ENDPOINTS.cms.staff, data);
  }
  //__________________________________________________________________________________________

  // Branches_________________________________________________________________________________
  async getBranches(data) {
    return this.request.get(API_ENDPOINTS.cms.branches, data);
  }
  //__________________________________________________________________________________________

  // Category_________________________________________________________________________________
  async getCategories(data) {
    return this.request.get(API_ENDPOINTS.cms.category, data);
  }
  async getCategoryDetail(data) {
    return this.request.get(`${API_ENDPOINTS.cms.category}/${data.id}`, data);
  }
  async createCategory(data) {
    return this.request.post(API_ENDPOINTS.cms.category, data);
  }
  async deleteCategory(data) {
    return this.request.delete(
      `${API_ENDPOINTS.cms.category}/${data.id}`,
      data,
    );
  }
  async updateCategory(data) {
    return this.request.patch(`${API_ENDPOINTS.cms.category}/${data.id}`, data);
  }
  //__________________________________________________________________________________________

  // Subjects_________________________________________________________________________________
  async getSubjects(data) {
    return this.request.get(API_ENDPOINTS.cms.subjects, data);
  }
  async getAllSubject(data) {
    return this.request.get(API_ENDPOINTS.cms.all_subject, data);
  }
  async getSubjectDetail(data) {
    return this.request.get(`${API_ENDPOINTS.cms.subject}?id=${data.id}`, data);
  }
  async createSubject(data) {
    return this.request.post(API_ENDPOINTS.cms.subject, data);
  }
  async updateSubject(data) {
    return this.request.patch(API_ENDPOINTS.cms.subject, data);
  }
  async deleteSubject(data) {
    return this.request.delete(API_ENDPOINTS.cms.subject, data);
  }
  // lesson_________________________________________________________________________________________-
  async getListLesson(data) {
    return this.request.get(API_ENDPOINTS.cms.lessons, data);
  }
  // Shift____________________________________________________________________________________
  async getShift(data) {
    return this.request.get(API_ENDPOINTS.cms.shifts, data);
  }
  async getShiftDetail(data) {
    return this.request.get(API_ENDPOINTS.cms.shift, data);
  }
  async createShift(data) {
    return this.request.post(API_ENDPOINTS.cms.shift, data);
  }
  async updateShift(data) {
    return this.request.patch(API_ENDPOINTS.cms.shift, data);
  }
  async deleteShift(data) {
    return this.request.delete(`${API_ENDPOINTS.cms.shift}/${data.id}`, data);
  }
  //__________________________________________________________________________________________

  //administrative - Đơn vị hành chính________________________________________________________
  async getProvinces(data) {
    return this.request.get(API_ENDPOINTS.cms.provinces, data);
  }
  async getDistricts(data) {
    return this.request.get(API_ENDPOINTS.cms.districts, data);
  }
  //__________________________________________________________________________________________

  //class_____________________________________________________________________________________
  async createClass(data) {
    return this.request.post(API_ENDPOINTS.cms.class, data);
  }
  async getClasses(data) {
    return this.request.get(API_ENDPOINTS.cms.classes, data);
  }
  async getClassStudent(data) {
    return this.request.get(
      `${API_ENDPOINTS.cms.class}/${data.id}/student`,
      data,
    );
  }
  async addStudentsToClass(data) {
    return this.request.post(`${API_ENDPOINTS.cms.students}/add-student`, data);
  }

  async getClassById(data) {
    return this.request.get(`${API_ENDPOINTS.cms.class}/${data.id}`, data);
  }

  async updateClass(data) {
    return this.request.patch(API_ENDPOINTS.cms.class, data);
  }

  async deleteClass(data) {
    return this.request.delete(`${API_ENDPOINTS.cms.class}/${data.id}`, data);
  }
  async cancelClass(data) {
    return this.request.patch(
      `${API_ENDPOINTS.cms.cancel_class}/${data.id}`,
      data,
    );
  }
  //__________________________________________________________________________________________

  // Permissions groups_______________________________________________________________________
  async getPermissionGroups(data) {
    return this.request.get(API_ENDPOINTS.cms.permissionGroup, data);
  }
  async getPermissionGroupsDetails(data) {
    return this.request.get(
      `${API_ENDPOINTS.cms.permissionGroup}/${data.id}`,
      data,
    );
  }
  async createPermissionGroups(data) {
    return this.request.post(API_ENDPOINTS.cms.permissionGroup, data);
  }
  async updatePermissionGroups(data) {
    return this.request.put(
      `${API_ENDPOINTS.cms.permissionGroup}/${data.id}`,
      data,
    );
  }
  async deletePermissionGroups(data) {
    return this.request.delete(`${API_ENDPOINTS.cms.permissionGroup}`, data);
  }
  //__________________________________________________________________________________________

  // Permissions tags_________________________________________________________________________
  async getPermissionTags(data) {
    return this.request.get(API_ENDPOINTS.cms.permissionTag, data);
  }
  //__CLassroom________________________________________________________________________________________
  async getClassrooms(data) {
    return this.request.get(API_ENDPOINTS.cms.classrooms, data);
  }
  async createClassroom(data) {
    return this.request.post(API_ENDPOINTS.cms.classrooms, data);
  }
  async getDetailClassroom(data) {
    return this.request.get(`${API_ENDPOINTS.cms.classroom}/${data.id}`, data);
  }
  async updateClassroom(data) {
    return this.request.put(`${API_ENDPOINTS.cms.classrooms}/${data.id}`, data);
  }
  async deleteClassroom(data) {
    return this.request.delete(
      `${API_ENDPOINTS.cms.classrooms}/${data.id}`,
      data,
    );
  }
  //center ______________________________________________________________________________________
  async getCenter(data) {
    return this.request.get(API_ENDPOINTS.cms.center, data);
  }
  async updateCenter(data) {
    return this.request.put(API_ENDPOINTS.cms.center, data);
  }
  //schedule____________________________________________________________________________________
  async getScheduleClassStudent(data) {
    return this.request.get(API_ENDPOINTS.cms.schedule_class_student, data);
  }
}

class RestAPI {
  constructor() {
    this.request = new Request();
    this.cms = new CMSManager(this.request);
  }
}

export default () => ({ restAPI: new RestAPI() });
