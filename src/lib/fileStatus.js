export const FILE_STATUS = Object.freeze({
  PENDING:            "pending",
  REVIEW:             "review",
  PARTIALLY_APPROVED: "partially_approved",
  APPROVED:           "approved", 
  REJECTED:           "rejected", 
  NOT_REQUIRED:       "not_required"
})

export const FILE_STATUS_COLORS = Object.freeze({
  [FILE_STATUS.PENDING]: {
    bg:   "#FEF3C7",
    text: "#92400E",
  },
  [FILE_STATUS.REVIEW]: {
    bg:   "#DBEAFE",
    text: "#1E40AF",
  },
  [FILE_STATUS.NOT_REQUIRED]: {
    bg:   "#DBEAFE",
    text: "#1E40AF",
  },
  [FILE_STATUS.PARTIALLY_APPROVED]: {
    bg:   "#FEF9C3",
    text: "#713F12",
  },
  [FILE_STATUS.APPROVED]: {
    bg:   "#DCFCE7",
    text: "#166534",
  },
  [FILE_STATUS.PARTIALLY_REJECTED]: {
    bg:   "#FFF3E0",
    text: "#BF360C",
  },
  [FILE_STATUS.REJECTED]: {
    bg:   "#FFE4E6",
    text: "#9F1239",
  },
  [FILE_STATUS.ROLLBACK]: {
    bg:   "#F3E5F5",
    text: "#4A148C",
  },
})
