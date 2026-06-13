/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PetListing {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  type: 'lost' | 'found';
  animalType: 'Dog' | 'Cat' | 'Bird' | 'Parrot' | 'Rabbit' | 'Other';
  name?: string;
  description: string;
  date: string;
  location: string;
  city: string; // e.g. tbilisi, batumi, kutaisi
  contactPhone: string;
  contactInfo?: string;
  reward?: string;
  photo: string; // base64 representation of pet image
  status: 'active' | 'reunited';
  views: number;
  createdAt: any; // Date/any
  updatedAt: any; // Date/any
}

export interface UserPublicProfile {
  displayName: string;
  joinedAt: string;
}

export interface UserPrivateProfile {
  email: string;
  phone?: string;
  isAdmin?: boolean;
}

export type Language = 'en' | 'ka';

export interface TranslationSet {
  brandName: string;
  tagline: string;
  searchPlaceholder: string;
  heroButtonLost: string;
  heroButtonFound: string;
  latestPosts: string;
  statsTitle: string;
  statsSubtitle: string;
  statsTotal: string;
  statsLostCount: string;
  statsFoundCount: string;
  statsReunitedCount: string;
  filterAll: string;
  filterLost: string;
  filterFound: string;
  filterAnimalType: string;
  filterCity: string;
  filterStatus: string;
  filterStatusAll: string;
  filterStatusActive: string;
  filterStatusReunited: string;
  viewDetails: string;
  rewardLabel: string;
  postDate: string;
  locationLabel: string;
  phoneLabel: string;
  contactPoster: string;
  reunitedLabel: string;
  reportLostTitle: string;
  reportFoundTitle: string;
  editListingTitle: string;
  formPhoto: string;
  formPhotoHelper: string;
  formAnimalType: string;
  formAnimalTypePlaceholder: string;
  formName: string;
  formNamePlaceholder: string;
  formDescription: string;
  formDescriptionPlaceholder: string;
  formDateLost: string;
  formDateFound: string;
  formLocation: string;
  formLocationPlaceholder: string;
  formCity: string;
  formPhone: string;
  formPhonePlaceholder: string;
  formContactInfo: string;
  formContactInfoPlaceholder: string;
  formReward: string;
  formRewardPlaceholder: string;
  formSubmit: string;
  formSaving: string;
  formCancel: string;
  loginRequired: string;
  loginToReport: string;
  loginTitle: string;
  loginButton: string;
  signupTitle: string;
  signupButton: string;
  logoutButton: string;
  emailLabel: string;
  passwordLabel: string;
  displayNameLabel: string;
  noListings: string;
  reunitedStatusButton: string;
  deleteButton: string;
  editButton: string;
  shareListing: string;
  shareSuccess: string;
  mapTitle: string;
  mapSubtitle: string;
  adminDashboard: string;
  adminManageListings: string;
  adminRemoveInappropriate: string;
  adminUserCount: string;
  profileTitle: string;
  profileMyListings: string;
  reunitedDialog: string;
  adminBadge: string;
  guestUser: string;
  favoritesTitle: string;
  noFavorites: string;
  notificationTitle: string;
  notificationNewListing: string;
  favoritesOnly: string;
}
