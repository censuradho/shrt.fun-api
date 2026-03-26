export interface GeolocationResult {
  country: string | null
  city: string | null
}

export interface IGeolocationService {
  lookup(ip: string): GeolocationResult
}
