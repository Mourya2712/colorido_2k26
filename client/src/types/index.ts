export type SectionId = 'home' | 'cultural' | 'sports';
export type SportsCategory = 'boys' | 'girls';

export interface RuleItem {
  title: string;
  points: string[];
}

export interface BaseEvent {
  id: string;
  name: string;
  category: string;
  tagline?: string;
  date: string;
  time: string;
  venue: string;
  shortDescription: string;
  registrationFee: string;
  rules: RuleItem[];
  registrationType: 'cultural' | 'boysSports' | 'girlsSports';
  image?: string;
  colorScheme?: string;
  teamSize?: string;
}

export interface CulturalCategory {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  iconName: string;
  hotspotPosition: [number, number, number]; // 3D coordinates in OAT model
  cameraPosition: [number, number, number]; // 3D camera target
  hotspotLabel: string;
  events: BaseEvent[];
}

export interface SportsEvent extends BaseEvent {
  gender: 'boys' | 'girls';
  venueId: string;
  matchFormat?: string;
  accentColor: string;
}

export interface VenueInfo {
  id: string;
  name: string;
  locationDetails: string;
  description: string;
  images: string[];
  features: string[];
  guidedViewAngles: {
    label: string;
    description: string;
    imageIndex: number;
    zoomLevel: number;
  }[];
}

export interface FestivalConfig {
  name: string;
  collegeName: string;
  collegeShort: string;
  tagline: string;
  aboutText: string;
  dates: string;
  registrationFeeNotice: string;
  announcementTickerText: string;
  posterAsset: string;
  collegeBackgroundAsset: string;
  collegeLogoAsset: string;
  address: string;
  contactDetails: string;
  socialLinks: {
    instagram: string;
    youtube: string;
    facebook: string;
    email: string;
  };
  registrationUrls: {
    cultural: string;
    boysSports: string;
    girlsSports: string;
  };
}
