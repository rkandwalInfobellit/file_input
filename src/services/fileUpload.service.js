import { apiClient } from "@/lib/apiClient"
import { API_ROUTES } from "@/lib/apiRoutes"

const FileUploadService = {
  async submit({ governed_apps, clouds, category_id, file_name, input_version, change_type, description }) {
    const { data } = await apiClient.post(API_ROUTES.FILE_UPLOAD_SUBMIT, {
      governed_apps,
      clouds,
      category_id,
      file_name,
      input_version,
      change_type,
      description,
    })
    return data?.Data ?? data
  },

  async uploadToS3(uploadUrl, file) {
    await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type || "application/octet-stream" },
    })
  },
}

export default FileUploadService
