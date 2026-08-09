/**
 * Domain types aligned with SSR Backend API (camelCase).
 * @see SSR_BE/docs/API.md
 */

export type PlotStatus = "available" | "reserved" | "sold" | "blocked";

export type PlotFacing =
  | "east"
  | "west"
  | "north"
  | "south"
  | "north_east"
  | "north_west"
  | "south_east"
  | "south_west";

export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
  lastSignInAt?: string | null;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
  token_type: string;
}

export interface LoginResult {
  user: AuthUser;
  session: AuthSession;
}

export interface BrandSettings {
  id: string | null;
  legacyYears: number;
  completedProjectsCount: number;
  happyCustomersCount: number;
  contactPhone: string;
  contactEmail: string;
  officeAddress: string;
  proprietorMessage: string | null;
  updatedAt: string | null;
}

export interface Venture {
  id: string;
  title: string;
  slug: string;
  location: string;
  description?: string | null;
  googleMapsUrl: string | null;
  youtubeVideoUrl: string | null;
  dtcpReraNumber: string | null;
  totalPlots: number;
  svgLayoutUrl: string | null;
  coverImageUrl?: string | null;
  brochurePdfUrl?: string | null;
  createdAt: string;
  availablePlots?: number;
}

export interface Plot {
  id: string;
  ventureId: string;
  plotNumber: string;
  svgElementId: string | null;

  eastDim?: string | null;
  westDim?: string | null;
  northDim?: string | null;
  southDim?: string | null;

  areaSqFt?: string | number | null;
  areaGadhi?: string | number | null;
  areaSqYards: string | number;

  pricePerGadhi?: string | number | null;
  pricePerSqFt?: string | number | null;
  pricePerSqYard: string | number;

  facing: PlotFacing | string | null;
  status: PlotStatus;
  roadWidthFt?: string | number | null;
  createdAt: string;
}

export interface UpdatePlotPayload {
  status?: PlotStatus;
  eastDim?: string | null;
  westDim?: string | null;
  northDim?: string | null;
  southDim?: string | null;
  areaSqFt?: number;
  areaSqYards?: number;
  areaGadhi?: number;
  pricePerSqYard?: number;
  pricePerSqFt?: number | null;
  pricePerGadhi?: number | null;
  facing?: PlotFacing | string;
  roadWidthFt?: number;
}

export interface VentureDetail extends Venture {
  plots: Plot[];
  reservedPlots?: number;
  soldPlots?: number;
  blockedPlots?: number;
}

export type BookingStatus = "active" | "cancelled";

export interface Booking {
  id: string;
  plotId: string;
  customerName: string;
  customerPhone: string;
  agreedRatePerSqYard: string | number;
  totalAmount: string | number;
  advancePaid: string | number;
  bookingDate: string;
  notes: string | null;
  status?: BookingStatus;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  forfeitedAdvance?: boolean;
  createdAt: string;
  plot?: {
    id: string;
    plotNumber: string;
    ventureId: string;
    areaSqYards?: string | number;
    areaGadhi?: string | number;
    areaSqFt?: string | number;
    status: PlotStatus;
    facing?: PlotFacing | string | null;
    venture?: { id: string; title: string; slug: string };
  };
}

export interface UpdateBookingPayload {
  advancePaid?: number;
  notes?: string | null;
  customerName?: string;
  customerPhone?: string;
  settleFullPayment?: boolean;
  markPlotSold?: boolean;
  cancel?: boolean;
  /** Required when cancelling a booking whose plot is already sold. */
  confirmVoidSale?: boolean;
  cancelReason?: string | null;
  forfeitedAdvance?: boolean;
}

export interface Lead {
  id: string;
  ventureId: string;
  plotNumber: string | null;
  name: string;
  phone: string;
  message: string | null;
  createdAt: string;
  venture?: { id: string; title: string; slug: string };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: Pagination;
}

export interface GlobalAnalytics {
  ventures: { total: number };
  plots: {
    total: number;
    available: number;
    reserved: number;
    sold: number;
    blocked?: number;
    totalSqYards: number;
  };
  valuation: { grossPotentialValue: number };
  financials: {
    totalRealizedRevenue: number;
    totalAdvanceCollected: number;
    totalPendingReceivables: number;
  };
  leads: { total: number };
}

export interface VentureAnalytics {
  venture: Venture;
  inventory: {
    totalPlots: number;
    byStatus: {
      available: number;
      reserved: number;
      sold: number;
      blocked?: number;
    };
    sqYards: {
      available: number;
      reserved: number;
      sold: number;
      blocked?: number;
      committed: number;
    };
  };
  valuation: {
    potentialValue: number;
    realizedValue: number;
  };
  financials: {
    advanceCollected: number;
    pendingReceivables: number;
  };
  leads: { total: number };
  previews: {
    recentBookings: Array<{
      id: string;
      customerName: string;
      customerPhone: string;
      agreedRatePerSqYard: number | string;
      totalAmount: number | string;
      advancePaid: number | string;
      bookingDate: string;
      createdAt: string;
      plot: { id: string; plotNumber: string; status: PlotStatus };
    }>;
    recentLeads: Array<{
      id: string;
      name: string;
      phone: string;
      plotNumber: string | null;
      message: string | null;
      createdAt: string;
    }>;
  };
}

export interface CreateBookingPayload {
  plotId: string;
  customerName: string;
  customerPhone: string;
  agreedRatePerSqYard: number;
  advancePaid: number;
  notes?: string;
  bookingDate?: string;
}

export interface CreateLeadPayload {
  ventureId: string;
  plotNumber?: string;
  name: string;
  phone: string;
  message?: string;
}

export interface CreateVentureResult {
  venture: Venture;
  plots: Plot[];
}

export interface UpdateBrandPayload {
  legacyYears?: number;
  completedProjectsCount?: number;
  happyCustomersCount?: number;
  contactPhone?: string;
  contactEmail?: string;
  officeAddress?: string;
  proprietorMessage?: string | null;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
