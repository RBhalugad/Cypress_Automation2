// cypress/types/api.types.ts

// ─── Domain Models ────────────────────────────────────────────────────────────

export interface Post {
    id: number;
    userId: number;
    title: string;
    body: string;
}

export interface CreatePostPayload {
    title: string;
    body: string;
    userId: number;
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {
    id?: number;
}

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    phone: string;
    website: string;
    address: Address;
    company: Company;
}

export interface CreateUserPayload {
    name: string;
    email: string;
    phone?: string;
}

export interface Address {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
}

export interface Company {
    name: string;
    catchPhrase: string;
    bs: string;
}

export interface Comment {
    id: number;
    postId: number;
    name: string;
    email: string;
    body: string;
}

export interface Todo {
    id: number;
    userId: number;
    title: string;
    completed: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginPayload {
    userName: string;
    password: string;
}

export interface GenerateTokenResponse {
    token: string;
    expires: string;
    status: string;
    result: string;
}

export interface LoginResponse {
    token: string;
    refreshToken?: string;
    expiresIn: number;
    user: Pick<User, 'id' | 'username' | 'email'>;
}

export interface UserResponse {
    userId?: string;
    userID?: string;
    username: string;
    books: Book[];
}

export interface Book {
    isbn: string;
    title: string;
    subTitle: string;
    author: string;
    publish_date: string;
    publisher: string;
    pages: number;
    description: string;
    website: string;
}

export interface BooksResponse {
    books: Book[];
}

export interface CollectionOfIsbn {
    isbn: string;
}

export interface PostBooksPayload {
    userId: string;
    collectionOfIsbns: CollectionOfIsbn[];
}

export interface OAuthTokenResponse {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    scope: string;
}

// ─── Generic API Envelope ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    code: string;
    details?: Record<string, string[]>;
}

export interface ValidationError {
    errors: Array<{
        field: string;
        message: string;
    }>;
}

// ─── Job / Async ──────────────────────────────────────────────────────────────

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
    jobId: string;
    status: JobStatus;
    createdAt: string;
    completedAt?: string;
    downloadUrl?: string;
}

// ─── GraphQL ──────────────────────────────────────────────────────────────────

export interface GraphQLRequest<V = Record<string, unknown>> {
    query: string;
    variables?: V;
    operationName?: string;
}

export interface GraphQLResponse<T> {
    data: T;
    errors?: Array<{ message: string; path?: string[] }>;
}

// ─── Cypress Env Config ───────────────────────────────────────────────────────

export interface EnvConfig {
    apiUrl: string;
    authToken: string;
    apiKey?: string;
}

export interface MultiEnvConfig {
    dev: EnvConfig;
    staging: EnvConfig;
    production: EnvConfig;
}

// placeAPI

export interface AddPlace {
    location: Location;
    accuracy: number;
    name: string;
    phone_number: string;
    address: string;
    types: string[];
    website: string;
    language: string;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface UpdatePlace extends Partial<AddPlace> {
    place_id: string;
    address: string;
    key: string;
}
