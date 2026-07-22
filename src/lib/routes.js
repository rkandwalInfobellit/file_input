export const ROUTES = Object.freeze({
  FILE_CATALOG: "/file-list",
  FILE_DETAIL: (id) => `/file/${id}`,
  UPLOAD_VALIDATE: "/add-file",
  APPROVALS: "/approvals",
  VERSIONING: "/versioning",
  RELEASE: "/release",
  CONFIGURATION: "/configuration",
  NOT_AUTHORIZED: "/not-authorized",
  LOGIN: "/login",
  NOT_FOUND: "*"
});
