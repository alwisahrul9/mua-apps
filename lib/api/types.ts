export type BookingStatus = "PENDING" | "DP_PAID" | "COMPLETED" | "CANCELED";

export type PaymentMethod = {
  accountName: string;
  paymentName: string;
  accountNumber: string;
};

export type MuaProfile = {
  id: string;
  userId: string;
  slug: string;
  brandName: string;
  homepageIsActive: boolean;
  username: string | null;
  tagline: string | null;
  heroTitle: string | null;
  heroDescription: string | null;
  supportedBrands: string[];
  serviceArea: string[];
  paymentMethod: PaymentMethod[] | null;
  profileImageUrl: string | null;
  coverImageUrl: string | null;
  instagramUsername: string | null;
  whatsappNumber: string | null;
  address: string | null;
};

export type Service = {
  id: string;
  userId?: string;
  name: string;
  description: string | null;
  price: number;
  iconName: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Portfolio = {
  id: string;
  userId?: string;
  title: string;
  category: string;
  imageUrl: string;
  altText: string;
  createdAt: string;
  updatedAt?: string;
};

export type Booking = {
  id: string;
  userId?: string;
  serviceId: string;
  clientName: string;
  whatsapp: string;
  instagram: string | null;
  totalPerson: number;
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  notes: string | null;
  paymentDeadline: string;
  customCode: string;
  status: BookingStatus;
  totalPrice: number;
  dpAmount: number;
  createdAt: string;
  updatedAt?: string;
  service?: Service;
};

export type Notification = {
  id: string;
  bookingId: string | null;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  emailVerifiedAt?: string | null;
  roles?: string[];
  permissions?: string[];
  profile?: MuaProfile | null;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type Paginated<T> = {
  data: T[];
  currentPage?: number;
  lastPage?: number;
  perPage?: number;
  total?: number;
};
