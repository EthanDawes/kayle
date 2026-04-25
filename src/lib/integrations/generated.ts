import type { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: any; output: any; }
  DateTime: { input: any; output: any; }
  DateTimeOffset: { input: any; output: any; }
  Decimal: { input: any; output: any; }
  Guid: { input: any; output: any; }
  HexColorCode: { input: any; output: any; }
  TimeOnly: { input: any; output: any; }
  Uri: { input: any; output: any; }
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  countryCode: Scalars['String']['output'];
  state: Scalars['String']['output'];
  street: Scalars['String']['output'];
  zip: Scalars['String']['output'];
};

/** Represents a print list for line card printing. */
export type AssemblyPrintList = Node & PrintList & {
  __typename?: 'AssemblyPrintList';
  creationTime: Scalars['DateTimeOffset']['output'];
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  modifiedTime: Scalars['DateTimeOffset']['output'];
  /** Primary key of the print list. */
  printListId?: Maybe<Scalars['Guid']['output']>;
  sections?: Maybe<Array<Maybe<PrintAssemblySection>>>;
  subtitle?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

/** Input type for mutating an assembly print list. */
export type AssemblyPrintListUpdate = {
  id: Scalars['ID']['input'];
  /** New assembly sections, or null to keep the existing sections. */
  sections?: InputMaybe<Array<InputMaybe<PrintListSectionInput>>>;
  /** New subtitle, or null to keep the existing subtitle */
  subtitle?: InputMaybe<Scalars['String']['input']>;
  /** New title, or null to keep the existing title. */
  title?: InputMaybe<Scalars['String']['input']>;
};

/** Root for querying data directly from CBORD */
export type Cbord = {
  __typename?: 'Cbord';
  /** Search for an item in CBORD by name */
  items?: Maybe<Array<Maybe<CbordItem>>>;
  /** Gets a single service unit by its CBORD primray key. */
  serviceUnit?: Maybe<ServiceUnit>;
  serviceUnits?: Maybe<Array<Maybe<ServiceUnit>>>;
};


/** Root for querying data directly from CBORD */
export type CbordItemsArgs = {
  search?: InputMaybe<Scalars['String']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


/** Root for querying data directly from CBORD */
export type CbordServiceUnitArgs = {
  cbordId?: InputMaybe<Scalars['Int']['input']>;
};

/** All of the available information on the item from CBORD. */
export type CbordItem = Node & {
  __typename?: 'CbordItem';
  /** Primary key for this item in the CBORD database */
  cbordItemId: Scalars['Int']['output'];
  /** The common name of the item in CBORD. */
  commonName?: Maybe<Scalars['String']['output']>;
  /** A list of CBORD item ids that are components of this item.  More efficient than the `components` field if all you need is the IDs. */
  componentIds?: Maybe<Array<Maybe<Scalars['Int']['output']>>>;
  /** A list of component items within this item. */
  components?: Maybe<Array<Maybe<CbordItem>>>;
  /** The date/time this item was first created in CBORD. */
  dateCreated?: Maybe<Scalars['DateTime']['output']>;
  /** The date/time the item was last modified in CBORD. */
  dateModified?: Maybe<Scalars['DateTime']['output']>;
  /** The formal name of the item in CBORD.  This is the version intended for public display. */
  formalName?: Maybe<Scalars['String']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  /** The ingredients this item is made up of */
  ingredients?: Maybe<Scalars['String']['output']>;
  /** A unique string identifying this item */
  keyName?: Maybe<Scalars['String']['output']>;
  /** The name of the item in CBORD. */
  name?: Maybe<Scalars['String']['output']>;
  /** A list of nutrition facts available for this item. */
  nutritionFacts?: Maybe<Array<Maybe<CbordNutritionFact>>>;
  /** A list of traits associated with this item. */
  traits?: Maybe<Array<Maybe<Trait>>>;
};

export type CbordItemAppearance = {
  __typename?: 'CbordItemAppearance';
  /** The primary key of the item in CBORD */
  cbordItemId: Scalars['Int']['output'];
  /** The primary key of the course in the CBORD database (often a Dining Court station) */
  courseId?: Maybe<Scalars['Int']['output']>;
  /** Name of the course in CBORD (often a Dining Court station) */
  courseName?: Maybe<Scalars['String']['output']>;
  /** The date this item is served. */
  date: Scalars['DateTime']['output'];
  /** All of the available information on the item from CBORD. */
  detail?: Maybe<CbordItem>;
  /** Name of this item exposed to the public */
  formalName?: Maybe<Scalars['String']['output']>;
  /** Name of the item */
  itemName?: Maybe<Scalars['String']['output']>;
  /** Unique string identifying this item */
  keyName?: Maybe<Scalars['String']['output']>;
  /** The meal this item is served. */
  meal?: Maybe<Scalars['String']['output']>;
};

/** Describes a nutrition fact, such as "Total Fat" or "Calories". */
export type CbordNutritionFact = {
  __typename?: 'CbordNutritionFact';
  /** The daily value, e.g. "17%".  Can be null. */
  dailyValueLabel?: Maybe<Scalars['String']['output']>;
  /** Formatted version of the value to be displayed on a label, e.g. "34g".  Can be null. */
  label?: Maybe<Scalars['String']['output']>;
  /** Name of the nutrition fact, e.g. "Calories" */
  name: Scalars['String']['output'];
  /** Numeric value of the nutrition  */
  value?: Maybe<Scalars['Decimal']['output']>;
};

export type ComponentAdministration = {
  __typename?: 'ComponentAdministration';
  isDisplayed: Scalars['Boolean']['output'];
  isPublished: Scalars['Boolean']['output'];
  item?: Maybe<Item>;
  itemId: Scalars['Guid']['output'];
  specialName?: Maybe<Scalars['String']['output']>;
};

/** Update a parstock component */
export type ComponentInput = {
  isDisplayed: Scalars['Boolean']['input'];
  /** Item ID */
  itemId: Scalars['Guid']['input'];
  specialName?: InputMaybe<Scalars['String']['input']>;
};

/** Gets the items served on a particular day. */
export type DailyMenu = {
  __typename?: 'DailyMenu';
  meals: Array<MealMenu>;
  notes: Scalars['String']['output'];
};

/** Metadata on a deleted node. */
export type DeletedNode = {
  __typename?: 'DeletedNode';
  /** ID of the deleted node. */
  deletedNodeId?: Maybe<Scalars['ID']['output']>;
};

/** Represents a residential dining court. */
export type DiningCourt = Location & Node & {
  __typename?: 'DiningCourt';
  address?: Maybe<Address>;
  adminMenu?: Maybe<MenuConfiguration>;
  bannerUrl?: Maybe<Scalars['Uri']['output']>;
  category: Scalars['String']['output'];
  dailyMenu?: Maybe<DailyMenu>;
  darkModeLogoUrl?: Maybe<Scalars['Uri']['output']>;
  formalName?: Maybe<Scalars['String']['output']>;
  googlePlaceId?: Maybe<Scalars['String']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  isLineLengthCrowdsourcingEnabled: Scalars['Boolean']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  lineLength?: Maybe<Scalars['String']['output']>;
  logoUrl?: Maybe<Scalars['Uri']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  normalHours: Array<DiningCourtNormalHoursPeriod>;
  phone?: Maybe<Scalars['String']['output']>;
  publishStatus: Array<PublishStatus>;
  transactMobileOrderId?: Maybe<Scalars['Int']['output']>;
  upcomingMeals: Array<UpcomingMeal>;
  url?: Maybe<Scalars['Uri']['output']>;
};


/** Represents a residential dining court. */
export type DiningCourtAdminMenuArgs = {
  date: Scalars['Date']['input'];
};


/** Represents a residential dining court. */
export type DiningCourtDailyMenuArgs = {
  date: Scalars['Date']['input'];
};


/** Represents a residential dining court. */
export type DiningCourtPublishStatusArgs = {
  endDate: Scalars['Date']['input'];
  startDate: Scalars['Date']['input'];
};

export type DiningCourtCategory = {
  __typename?: 'DiningCourtCategory';
  diningCourts: Array<DiningCourt>;
  name?: Maybe<Scalars['String']['output']>;
};

export type DiningCourtNormalHoursDay = {
  __typename?: 'DiningCourtNormalHoursDay';
  dayOfWeek: Scalars['String']['output'];
  meals: Array<DiningCourtNormalHoursMeal>;
};

export type DiningCourtNormalHoursMeal = {
  __typename?: 'DiningCourtNormalHoursMeal';
  endTime: Scalars['TimeOnly']['output'];
  name?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['TimeOnly']['output'];
};

export type DiningCourtNormalHoursPeriod = {
  __typename?: 'DiningCourtNormalHoursPeriod';
  days: Array<DiningCourtNormalHoursDay>;
  effectiveDate: Scalars['DateTime']['output'];
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
};

export type FavoritedItem = Node & {
  __typename?: 'FavoritedItem';
  dateAdded?: Maybe<Scalars['DateTimeOffset']['output']>;
  favoriteId: Scalars['Guid']['output'];
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  item: Item;
};

/** All of the available information on the item from CBORD. */
export type Item = Node & {
  __typename?: 'Item';
  appearances: Array<ItemOccurrence>;
  /** The components of this item, if any */
  components?: Maybe<Array<Item>>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  /** The ingredients this item is made up of */
  ingredients?: Maybe<Scalars['String']['output']>;
  isBlacklisted: Scalars['Boolean']['output'];
  isCbordItem: Scalars['Boolean']['output'];
  isDiscontinued: Scalars['Boolean']['output'];
  isFlaggedForCurrentUser: Scalars['Boolean']['output'];
  isHiddenForCurrentUser: Scalars['Boolean']['output'];
  isNutritionReady: Scalars['Boolean']['output'];
  /** The unique identifier of the item, in common with the V2 REST API */
  itemId: Scalars['Guid']['output'];
  /** The name of the item in CBORD. */
  name: Scalars['String']['output'];
  /** A list of nutrition facts available for this item. */
  nutritionFacts?: Maybe<Array<NutritionFact>>;
  /** A list of traits associated with this item. */
  traits?: Maybe<Array<Trait>>;
};

/** Provides information for administering an occurrence of an item on a menu */
export type ItemAdministration = {
  __typename?: 'ItemAdministration';
  components?: Maybe<Array<ComponentAdministration>>;
  isDisplayed: Scalars['Boolean']['output'];
  isPublished: Scalars['Boolean']['output'];
  item?: Maybe<Item>;
  itemMenuId: Scalars['Guid']['output'];
  specialName?: Maybe<Scalars['String']['output']>;
};

/** Represents an occurrence of a served item. */
export type ItemAppearance = Node & {
  __typename?: 'ItemAppearance';
  /** These are the menued parstock components for one particular date/meal/station. */
  components?: Maybe<Array<ItemAppearance>>;
  displayName: Scalars['String']['output'];
  /** True if this item has sub-components.  Useful if you don't want to fetch component info yet. */
  hasComponents: Scalars['Boolean']['output'];
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  item: Item;
  /** Unique identifier for this occurrence of an item on a menu. */
  itemMenuId: Scalars['Guid']['output'];
  specialName?: Maybe<Scalars['String']['output']>;
};

/** Update a menued item */
export type ItemInput = {
  /** Parstock item configuration.  If set to null, default parstock behavior will apply. */
  components?: InputMaybe<Array<InputMaybe<ComponentInput>>>;
  isDisplayed: Scalars['Boolean']['input'];
  /** Item ID */
  itemId: Scalars['Guid']['input'];
  /** Item Menu ID */
  itemMenuId?: InputMaybe<Scalars['Guid']['input']>;
  specialName?: InputMaybe<Scalars['String']['input']>;
};

export type ItemOccurrence = {
  __typename?: 'ItemOccurrence';
  date: Scalars['DateTimeOffset']['output'];
  locationName: Scalars['String']['output'];
  mealName: Scalars['String']['output'];
  stationName: Scalars['String']['output'];
};

/** Represents a print list for line card printing. */
export type LineCardPrintList = Node & PrintList & {
  __typename?: 'LineCardPrintList';
  creationTime: Scalars['DateTimeOffset']['output'];
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  items?: Maybe<Array<Maybe<PrintItem>>>;
  modifiedTime: Scalars['DateTimeOffset']['output'];
  /** Primary key of the print list. */
  printListId?: Maybe<Scalars['Guid']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

/** Input type for mutating an line card print list. */
export type LineCardPrintListUpdate = {
  id?: InputMaybe<Scalars['ID']['input']>;
  items?: InputMaybe<Array<InputMaybe<PrintItemInput>>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type Location = {
  address?: Maybe<Address>;
  bannerUrl?: Maybe<Scalars['Uri']['output']>;
  category: Scalars['String']['output'];
  darkModeLogoUrl?: Maybe<Scalars['Uri']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  logoUrl?: Maybe<Scalars['Uri']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  transactMobileOrderId?: Maybe<Scalars['Int']['output']>;
  url?: Maybe<Scalars['Uri']['output']>;
};

export type LocationCategory = {
  __typename?: 'LocationCategory';
  locations: Array<Location>;
  name?: Maybe<Scalars['String']['output']>;
};

/** Provides information for meal administration */
export type MealConfiguration = {
  __typename?: 'MealConfiguration';
  endTime?: Maybe<Scalars['TimeOnly']['output']>;
  id: Scalars['Guid']['output'];
  name: Scalars['String']['output'];
  normalEndTime?: Maybe<Scalars['TimeOnly']['output']>;
  normalStartTime?: Maybe<Scalars['TimeOnly']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['TimeOnly']['output']>;
  state: MealState;
  stations: Array<StationConfiguration>;
};

/** Update a daily meal */
export type MealInput = {
  endTime?: InputMaybe<Scalars['TimeOnly']['input']>;
  /** Meal Menu ID */
  id: Scalars['Guid']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  startTime?: InputMaybe<Scalars['TimeOnly']['input']>;
  state: MealState;
  stations?: InputMaybe<Array<InputMaybe<StationInput>>>;
};

/** Represents a meal, e.g. "Lunch". */
export type MealMenu = Node & {
  __typename?: 'MealMenu';
  endTime?: Maybe<Scalars['DateTimeOffset']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  /** @deprecated Use name instead */
  meal: Scalars['String']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  startTime?: Maybe<Scalars['DateTimeOffset']['output']>;
  stations: Array<Station>;
  status: MealStatus;
  type: MealType;
};

/** Meal state configurable by menu admins (closed/open/hidden) */
export enum MealState {
  /** Closed, no meal will be served, but meal is visible on menu */
  Closed = 'CLOSED',
  /** Not visible on public menu */
  Hidden = 'HIDDEN',
  /** Open for dining */
  Open = 'OPEN'
}

/** Open/closed state of a meal. */
export enum MealStatus {
  /** No meal will be served. */
  Closed = 'CLOSED',
  /** The meal is open. */
  Open = 'OPEN',
  /** The menu is yet to be determined. */
  Unavailable = 'UNAVAILABLE'
}

/** Provides a hint to the type of meal being served. */
export enum MealType {
  /** Breakfast */
  Breakfast = 'BREAKFAST',
  /** Dinner */
  Dinner = 'DINNER',
  /** Lunch */
  Lunch = 'LUNCH',
  /** Snack */
  Snack = 'SNACK',
  /** Unknown */
  Unknown = 'UNKNOWN'
}

/** Provides information for menu administration */
export type MenuConfiguration = {
  __typename?: 'MenuConfiguration';
  id: Scalars['Guid']['output'];
  meals: Array<MealConfiguration>;
  notes?: Maybe<Scalars['String']['output']>;
};

/** Update a daily menu */
export type MenuInput = {
  date: Scalars['Date']['input'];
  locationId: Scalars['String']['input'];
  meals?: InputMaybe<Array<InputMaybe<MealInput>>>;
  notes?: InputMaybe<Scalars['String']['input']>;
};

/** Root for modifying data */
export type MenusMutation = {
  __typename?: 'MenusMutation';
  addFavoriteById: Array<FavoritedItem>;
  addFavoriteByItemId: Array<FavoritedItem>;
  /** Creates a new non-CBORD item with a particular name. */
  createNonCbordItem?: Maybe<Item>;
  createPrintList?: Maybe<PrintList>;
  deletePrintList?: Maybe<DeletedNode>;
  editFavorites: Array<FavoritedItem>;
  editFavoritesWithItemIds: Array<FavoritedItem>;
  modifyAssemblyPrintList?: Maybe<AssemblyPrintList>;
  modifyAssemblyPrintSection?: Maybe<PrintAssemblySection>;
  modifyLineCardPrintList?: Maybe<LineCardPrintList>;
  modifyPrintItem?: Maybe<PrintItem>;
  removeFavorite: Array<FavoritedItem>;
  removeFavoriteByFavoriteId: Array<FavoritedItem>;
  setBlacklisted: Item;
  setPublishStatus?: Maybe<MenuConfiguration>;
  updateMenu?: Maybe<MenuConfiguration>;
};


/** Root for modifying data */
export type MenusMutationAddFavoriteByIdArgs = {
  id: Scalars['ID']['input'];
};


/** Root for modifying data */
export type MenusMutationAddFavoriteByItemIdArgs = {
  itemId: Scalars['Guid']['input'];
};


/** Root for modifying data */
export type MenusMutationCreateNonCbordItemArgs = {
  name: Scalars['String']['input'];
};


/** Root for modifying data */
export type MenusMutationCreatePrintListArgs = {
  title: Scalars['String']['input'];
  type: PrintListType;
};


/** Root for modifying data */
export type MenusMutationDeletePrintListArgs = {
  id: Scalars['ID']['input'];
};


/** Root for modifying data */
export type MenusMutationEditFavoritesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


/** Root for modifying data */
export type MenusMutationEditFavoritesWithItemIdsArgs = {
  itemIds: Array<Scalars['Guid']['input']>;
};


/** Root for modifying data */
export type MenusMutationModifyAssemblyPrintListArgs = {
  input: AssemblyPrintListUpdate;
};


/** Root for modifying data */
export type MenusMutationModifyAssemblyPrintSectionArgs = {
  input: PrintListSectionInput;
};


/** Root for modifying data */
export type MenusMutationModifyLineCardPrintListArgs = {
  input: LineCardPrintListUpdate;
};


/** Root for modifying data */
export type MenusMutationModifyPrintItemArgs = {
  input: PrintItemInput;
};


/** Root for modifying data */
export type MenusMutationRemoveFavoriteArgs = {
  id: Scalars['ID']['input'];
};


/** Root for modifying data */
export type MenusMutationRemoveFavoriteByFavoriteIdArgs = {
  favoriteId: Scalars['Guid']['input'];
};


/** Root for modifying data */
export type MenusMutationSetBlacklistedArgs = {
  isBlacklisted: Scalars['Boolean']['input'];
  itemId: Scalars['Guid']['input'];
};


/** Root for modifying data */
export type MenusMutationSetPublishStatusArgs = {
  date: Scalars['Date']['input'];
  isPublished: Scalars['Boolean']['input'];
  locationId: Scalars['String']['input'];
  meals?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};


/** Root for modifying data */
export type MenusMutationUpdateMenuArgs = {
  menu: MenuInput;
};

/** Root for querying data */
export type MenusQuery = {
  __typename?: 'MenusQuery';
  /** Root for querying data directly from CBORD */
  cbord?: Maybe<Cbord>;
  currentUser?: Maybe<User>;
  dietaryTraits: Array<Trait>;
  diningCourt?: Maybe<DiningCourt>;
  /** Get the dining court by the Location primary key, e.g. "ERHT" */
  diningCourtByLocationId?: Maybe<DiningCourt>;
  diningCourtByName?: Maybe<DiningCourt>;
  diningCourtCategories: Array<DiningCourtCategory>;
  diningCourts?: Maybe<Array<Maybe<DiningCourt>>>;
  itemAppearance: ItemAppearance;
  itemByItemId: Item;
  itemSearch: Array<Item>;
  locationCategories: Array<LocationCategory>;
  locations?: Maybe<Array<Maybe<Location>>>;
  node?: Maybe<Node>;
  printLists?: Maybe<Array<Maybe<PrintList>>>;
  retailLocation?: Maybe<RetailLocation>;
  retailLocations?: Maybe<Array<Maybe<RetailLocation>>>;
};


/** Root for querying data */
export type MenusQueryDiningCourtArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};


/** Root for querying data */
export type MenusQueryDiningCourtByLocationIdArgs = {
  locationId?: InputMaybe<Scalars['String']['input']>;
};


/** Root for querying data */
export type MenusQueryDiningCourtByNameArgs = {
  name: Scalars['String']['input'];
};


/** Root for querying data */
export type MenusQueryItemAppearanceArgs = {
  itemMenuId: Scalars['Guid']['input'];
};


/** Root for querying data */
export type MenusQueryItemByItemIdArgs = {
  itemId: Scalars['Guid']['input'];
};


/** Root for querying data */
export type MenusQueryItemSearchArgs = {
  name: Scalars['String']['input'];
};


/** Root for querying data */
export type MenusQueryNodeArgs = {
  id: Scalars['ID']['input'];
};


/** Root for querying data */
export type MenusQueryRetailLocationArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
};

export type Node = {
  id: Scalars['ID']['output'];
};

/** Describes a nutrition fact, such as "Total Fat" or "Calories". */
export type NutritionFact = {
  __typename?: 'NutritionFact';
  /** The daily value, e.g. "17%".  Can be null. */
  dailyValueLabel?: Maybe<Scalars['String']['output']>;
  /** Formatted version of the value to be displayed on a label, e.g. "34g".  Can be null. */
  label?: Maybe<Scalars['String']['output']>;
  /** Name of the nutrition fact, e.g. "Calories" */
  name?: Maybe<Scalars['String']['output']>;
  /** Numeric value of the nutrition fact */
  value?: Maybe<Scalars['Float']['output']>;
};

/** Represents a section on an assembly print list. */
export type PrintAssemblySection = Node & {
  __typename?: 'PrintAssemblySection';
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  items?: Maybe<Array<Maybe<PrintItem>>>;
  name?: Maybe<Scalars['String']['output']>;
};

/** Represents an item to be printed on a line card. */
export type PrintItem = Node & {
  __typename?: 'PrintItem';
  cbordItem?: Maybe<CbordItem>;
  /** Unique identifier of the CBORD item, or null if this is not a CBORD item. */
  cbordItemId?: Maybe<Scalars['Int']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  /** The number of line cards to print */
  quantity: Scalars['Int']['output'];
  /** A custom string to override the item name when printing. */
  specialName?: Maybe<Scalars['String']['output']>;
};

/** The number of line cards to print. */
export type PrintItemInput = {
  /** Unique identifier of the CBORD item, or null if this is not a CBORD item. */
  cbordItemId?: InputMaybe<Scalars['Int']['input']>;
  /** ID of the print item, or null to create a new one within the context of a session. */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** The number of line cards to print. */
  quantity?: InputMaybe<Scalars['Int']['input']>;
  /** A custom string to override the item name when printing. */
  specialName?: InputMaybe<Scalars['String']['input']>;
};

/** Represents a print list for line card printing. */
export type PrintList = {
  creationTime: Scalars['DateTimeOffset']['output'];
  id: Scalars['ID']['output'];
  modifiedTime: Scalars['DateTimeOffset']['output'];
  /** Primary key of the print list. */
  printListId?: Maybe<Scalars['Guid']['output']>;
  title?: Maybe<Scalars['String']['output']>;
};

/** Represents a section on an assembly print list. */
export type PrintListSectionInput = {
  /** ID of the section to update, or null to create a new section */
  id?: InputMaybe<Scalars['ID']['input']>;
  /** New items for this section, or null to keep them the same. */
  items?: InputMaybe<Array<InputMaybe<PrintItemInput>>>;
  /** New name for this section, or null to keep the same name. */
  name?: InputMaybe<Scalars['String']['input']>;
};

/** Style of print list. */
export enum PrintListType {
  /** A list for a collection of items */
  Assembly = 'ASSEMBLY',
  AssemblyCard = 'ASSEMBLY_CARD',
  /** A line card */
  LineCard = 'LINE_CARD',
  LineItemCard = 'LINE_ITEM_CARD'
}

export type PublishStatus = {
  __typename?: 'PublishStatus';
  date: Scalars['Date']['output'];
  isAbnormal: Scalars['Boolean']['output'];
  isOpen: Scalars['Boolean']['output'];
  isPublished: Scalars['Boolean']['output'];
  needsAttention: Scalars['Boolean']['output'];
};

export type RetailLocation = Location & Node & {
  __typename?: 'RetailLocation';
  address?: Maybe<Address>;
  bannerUrl?: Maybe<Scalars['Uri']['output']>;
  category: Scalars['String']['output'];
  darkModeLogoUrl?: Maybe<Scalars['Uri']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  latitude?: Maybe<Scalars['Float']['output']>;
  logoUrl?: Maybe<Scalars['Uri']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
  menuUrl?: Maybe<Scalars['Uri']['output']>;
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  transactMobileOrderId?: Maybe<Scalars['Int']['output']>;
  url?: Maybe<Scalars['Uri']['output']>;
};

/** Represents a dining operation where food is served. */
export type ServiceUnit = Node & {
  __typename?: 'ServiceUnit';
  /** The primary key of this service unit in CBORD. */
  cbordId: Scalars['Int']['output'];
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  /** Gets the items served on a particular day. */
  menu?: Maybe<Array<Maybe<CbordItemAppearance>>>;
  /** The name of the CBORD service unit, e.g. "Earhart Dining Court" */
  name?: Maybe<Scalars['String']['output']>;
};


/** Represents a dining operation where food is served. */
export type ServiceUnitMenuArgs = {
  date?: InputMaybe<Scalars['Date']['input']>;
};

/** Represents a station at a dining court. */
export type Station = Node & {
  __typename?: 'Station';
  backgroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  foregroundColor?: Maybe<Scalars['HexColorCode']['output']>;
  iconUrl?: Maybe<Scalars['Uri']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  items: Array<ItemAppearance>;
  name?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
};

/** Provides information for station administration */
export type StationConfiguration = {
  __typename?: 'StationConfiguration';
  id: Scalars['Guid']['output'];
  items: Array<ItemAdministration>;
  normalName: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  specialName?: Maybe<Scalars['String']['output']>;
  stationId: Scalars['Guid']['output'];
};

/** Update a menued meal station */
export type StationInput = {
  /** Station Menu ID */
  id: Scalars['Guid']['input'];
  items?: InputMaybe<Array<InputMaybe<ItemInput>>>;
  notes?: InputMaybe<Scalars['String']['input']>;
  specialName?: InputMaybe<Scalars['String']['input']>;
  /** Station ID */
  stationId: Scalars['Guid']['input'];
};

/** Describes a trait associated with a CBORD item, such as "Gluten" or "Vegetarian" */
export type Trait = Node & {
  __typename?: 'Trait';
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  /** Name of the trait. */
  name: Scalars['String']['output'];
  /** A URL to a PNG icon indicating the trait */
  pngIcon?: Maybe<Scalars['Uri']['output']>;
  /** A URL to a SVG icon indicating the trait */
  svgIcon?: Maybe<Scalars['Uri']['output']>;
  /** A URL to an SVG icon without a background indicating the trait */
  svgIconWithoutBackground?: Maybe<Scalars['Uri']['output']>;
  type: Scalars['String']['output'];
};

export type UpcomingMeal = {
  __typename?: 'UpcomingMeal';
  endTime: Scalars['DateTimeOffset']['output'];
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  startTime: Scalars['DateTimeOffset']['output'];
  type: Scalars['String']['output'];
};

export type User = Node & {
  __typename?: 'User';
  commonName: Scalars['String']['output'];
  email?: Maybe<Scalars['String']['output']>;
  favorites: Array<FavoritedItem>;
  firstName?: Maybe<Scalars['String']['output']>;
  /** The globally unique identifier of the node. */
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  printLists?: Maybe<Array<Maybe<PrintList>>>;
  puid: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type DiningCourtsQueryVariables = Exact<{
  date: Scalars['Date']['input'];
}>;


export type DiningCourtsQuery = { __typename?: 'MenusQuery', diningCourts?: Array<{ __typename?: 'DiningCourt', id: string, name: string, latitude?: number | null, longitude?: number | null, category: string, dailyMenu?: { __typename?: 'DailyMenu', meals: Array<{ __typename?: 'MealMenu', name: string, type: MealType, startTime?: any | null, endTime?: any | null }> } | null } | null> | null };

export type GetMenuQueryVariables = Exact<{
  location: Scalars['String']['input'];
  date: Scalars['Date']['input'];
}>;


export type GetMenuQuery = { __typename?: 'MenusQuery', diningCourtByName?: { __typename?: 'DiningCourt', id: string, name: string, dailyMenu?: { __typename?: 'DailyMenu', meals: Array<{ __typename?: 'MealMenu', name: string, type: MealType, startTime?: any | null, endTime?: any | null, stations: Array<{ __typename?: 'Station', name?: string | null, items: Array<{ __typename?: 'ItemAppearance', itemMenuId: any, displayName: string, item: { __typename?: 'Item', id: string, itemId: any, name: string, nutritionFacts?: Array<{ __typename?: 'NutritionFact', name?: string | null, label?: string | null, value?: number | null }> | null } }> }> }> } | null } | null };


export const DiningCourtsDocument = gql`
    query diningCourts($date: Date!) {
  diningCourts {
    id
    name
    latitude
    longitude
    category
    dailyMenu(date: $date) {
      meals {
        name
        type
        startTime
        endTime
      }
    }
  }
}
    `;
export const GetMenuDocument = gql`
    query getMenu($location: String!, $date: Date!) {
  diningCourtByName(name: $location) {
    id
    name
    dailyMenu(date: $date) {
      meals {
        name
        type
        startTime
        endTime
        stations {
          name
          items {
            itemMenuId
            displayName
            item {
              id
              itemId
              name
              nutritionFacts {
                name
                label
                value
              }
            }
          }
        }
      }
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string, variables?: any) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType, _variables) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    diningCourts(variables: DiningCourtsQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<DiningCourtsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<DiningCourtsQuery>({ document: DiningCourtsDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'diningCourts', 'query', variables);
    },
    getMenu(variables: GetMenuQueryVariables, requestHeaders?: GraphQLClientRequestHeaders, signal?: RequestInit['signal']): Promise<GetMenuQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<GetMenuQuery>({ document: GetMenuDocument, variables, requestHeaders: { ...requestHeaders, ...wrappedRequestHeaders }, signal }), 'getMenu', 'query', variables);
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;