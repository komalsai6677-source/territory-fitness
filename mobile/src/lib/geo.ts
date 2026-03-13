import { TerritoryMode, TerritoryTile } from '../types';

const EARTH_RADIUS_METERS = 6371000;
export const TILE_SIZE_DEGREES = 0.0012;

export function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function getDistanceMeters(
  start: { latitude: number; longitude: number },
  end: { latitude: number; longitude: number }
) {
  const latDelta = toRadians(end.latitude - start.latitude);
  const lonDelta = toRadians(end.longitude - start.longitude);
  const startLat = toRadians(start.latitude);
  const endLat = toRadians(end.latitude);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(startLat) * Math.cos(endLat) * Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2);

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

export function formatPace(distanceKm: number, durationSeconds: number) {
  if (distanceKm <= 0 || durationSeconds <= 0) {
    return '--:--';
  }

  const paceSeconds = Math.round(durationSeconds / distanceKm);
  const minutes = Math.floor(paceSeconds / 60);
  const seconds = paceSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getTileId(latitude: number, longitude: number) {
  const latBucket = Math.floor(latitude / TILE_SIZE_DEGREES);
  const lonBucket = Math.floor(longitude / TILE_SIZE_DEGREES);

  return `${latBucket}:${lonBucket}`;
}

export function getTileCenterFromId(tileId: string) {
  const [latBucket, lonBucket] = tileId.split(':').map(Number);

  return {
    latitude: latBucket * TILE_SIZE_DEGREES + TILE_SIZE_DEGREES / 2,
    longitude: lonBucket * TILE_SIZE_DEGREES + TILE_SIZE_DEGREES / 2,
  };
}

export function getTilePolygon(tileId: string) {
  const [latBucket, lonBucket] = tileId.split(':').map(Number);
  const minLatitude = latBucket * TILE_SIZE_DEGREES;
  const minLongitude = lonBucket * TILE_SIZE_DEGREES;
  const maxLatitude = minLatitude + TILE_SIZE_DEGREES;
  const maxLongitude = minLongitude + TILE_SIZE_DEGREES;

  return [
    { latitude: minLatitude, longitude: minLongitude },
    { latitude: minLatitude, longitude: maxLongitude },
    { latitude: maxLatitude, longitude: maxLongitude },
    { latitude: maxLatitude, longitude: minLongitude },
  ];
}

export function getTileIdFromRegion(region: {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}) {
  return getTileId(region.latitude, region.longitude);
}

export function mergeTiles(existingTiles: TerritoryTile[], capturedTileIds: string[], mode: TerritoryMode) {
  const tileMap = new Map(existingTiles.map((tile) => [`${tile.mode ?? 'run'}:${tile.id}`, tile]));

  capturedTileIds.forEach((tileId) => {
    tileMap.set(`${mode}:${tileId}`, {
      id: tileId,
      center: getTileCenterFromId(tileId),
      owner: 'you',
      mode,
    });
  });

  return Array.from(tileMap.values());
}
