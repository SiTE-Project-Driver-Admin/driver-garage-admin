export interface CommunityReport {
  id: string
  postId: string
  reporterId: string
  reason: string
  details: string | null
  status: "PENDING" | "REMOVED" | "DISMISSED"
  createdAt: string
  updatedAt: string

  post: {
    id: string
    title: string | null
    content: string
    imageUrl: string | null
    imageUrls: string[]
    authorId: string
    authorName: string
    createdAt: string
    author: {
      id: string
      firstName: string
      lastName: string
      email: string
      fullName: string
    }
  }

  reporter: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
}