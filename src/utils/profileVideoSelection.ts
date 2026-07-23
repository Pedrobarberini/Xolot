export function addProfileVideoSelection(
  selectedVideoIds: string[],
  videoId: string
) {
  return selectedVideoIds.includes(videoId)
    ? selectedVideoIds
    : [...selectedVideoIds, videoId];
}

export function toggleProfileVideoSelection(
  selectedVideoIds: string[],
  videoId: string
) {
  return selectedVideoIds.includes(videoId)
    ? selectedVideoIds.filter((selectedId) => selectedId !== videoId)
    : [...selectedVideoIds, videoId];
}
