const EARTH_RADIUS_METERS = 6371000;
const TILE_SIZE_DEGREES = 0.0012;

export function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function getDistanceMeters(start, end) {
  const latDelta = toRadians(end.latitude - start.latitude);
  const lonDelta = toRadians(end.longitude - start.longitude);
  const startLat = toRadians(start.latitude);
  const endLat = toRadians(end.latitude);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

export function getTileId(latitude, longitude) {
  const latBucket = Math.floor(latitude / TILE_SIZE_DEGREES);
  const lonBucket = Math.floor(longitude / TILE_SIZE_DEGREES);

  return `${latBucket}:${lonBucket}`;
}

export function getTileCenterFromId(tileId) {
  const [latBucket, lonBucket] = tileId.split(':').map(Number);

  return {
    latitude: latBucket * TILE_SIZE_DEGREES + TILE_SIZE_DEGREES / 2,
    longitude: lonBucket * TILE_SIZE_DEGREES + TILE_SIZE_DEGREES / 2,
  };
}

export function formatPace(distanceKm, durationSeconds) {
  if (distanceKm <= 0 || durationSeconds <= 0) {
    return '--:--';
  }

  const paceSeconds = Math.round(durationSeconds / distanceKm);
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = paceSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
