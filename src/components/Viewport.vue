<script setup lang="ts">
import { ref, onMounted } from "vue"
import {
  RenderingEngine,
  Enums,
  type Types,
  volumeLoader,
  cornerstoneStreamingImageVolumeLoader,
} from "@cornerstonejs/core"
import { init as csRenderInit, cache } from '@cornerstonejs/core';
import { init as csToolsInit } from '@cornerstonejs/tools';
import { init as dicomImageLoaderInit,  } from '@cornerstonejs/dicom-image-loader';
import wadors from '@cornerstonejs/dicom-image-loader/wadors';
import { api } from 'dicomweb-client';

// Add interface for function parameters
interface ImageMetadataParams {
  StudyInstanceUID: string;
  SeriesInstanceUID: string;
  SOPInstanceUID?: string | null;
  wadoRsRoot: string;
  client?: api.DICOMwebClient | null;
}

// Add type definitions
type InstanceMetadata = {
  [key: string]: {
    Value: string[];
  };
};

type WADORSMetaData = {
  [key: string]: any;
};

// Create refs
const elementRef = ref<HTMLDivElement | null>(null)
const running = ref(false)

async function createImageIdsAndCacheMetaData({
  StudyInstanceUID,
  SeriesInstanceUID,
  SOPInstanceUID = null,
  wadoRsRoot,
  client = null,
}: ImageMetadataParams) {
  const SOP_INSTANCE_UID = "00080018"
  const SERIES_INSTANCE_UID = "0020000E"

  const studySearchOptions = {
    studyInstanceUID: StudyInstanceUID,
    seriesInstanceUID: SeriesInstanceUID,
  }

  const dicomClient: api.DICOMwebClient = 
    client ?? 
    new api.DICOMwebClient({ url: wadoRsRoot, singlepart: true });
    
  const instances = await dicomClient.retrieveSeriesMetadata(studySearchOptions);
  const imageIds = instances.map((instanceMetaData: any) => {
    const seriesUID = instanceMetaData[SERIES_INSTANCE_UID]?.Value?.[0]
    if (!seriesUID) {
      throw new Error('Series Instance UID not found in metadata')
    }

    const sopUID = instanceMetaData[SOP_INSTANCE_UID]?.Value?.[0]
    if (!sopUID && !SOPInstanceUID) {
      throw new Error('SOP Instance UID not found in metadata')
    }

    const SOPInstanceUIDToUse = SOPInstanceUID || sopUID

    const prefix = "wadors:"
    const imageId =
      prefix +
      wadoRsRoot +
      "/studies/" +
      StudyInstanceUID +
      "/series/" +
      seriesUID +
      "/instances/" +
      SOPInstanceUIDToUse +
      "/frames/1"

    wadors.metaDataManager.add(
      imageId,
      instanceMetaData as WADORSMetaData
    )
    return imageId
  })

  return imageIds
}

// Setup function
const setup = async () => {
  if (running.value) {
    return
  }
  running.value = true
  await csRenderInit()
  await csToolsInit()
  dicomImageLoaderInit({ maxWebWorkers: 1})

  // Get Cornerstone imageIds and fetch metadata into RAM
  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      "2.16.840.1.114362.1.11972228.22789312658.616067305.306.2",
    SeriesInstanceUID:
      "2.16.840.1.114362.1.11972228.22789312658.616067305.306.3",
    wadoRsRoot: "https://d14fa38qiwhyfd.cloudfront.net/dicomweb",
  })

  // Instantiate a rendering engine
  const renderingEngineId = "myRenderingEngine"
  const renderingEngine = new RenderingEngine(renderingEngineId)
  const viewportId = "CT_STACK"

  const viewportInput = {
    viewportId,
    type: Enums.ViewportType.ORTHOGRAPHIC,
    element: elementRef.value as HTMLDivElement,
    defaultOptions: {
      orientation: Enums.OrientationAxis.SAGITTAL,
    },
  }

  renderingEngine.enableElement(viewportInput)

  // Get the viewport
  const viewport = renderingEngine.getViewport(
    viewportId
  ) as Types.IVolumeViewport

  // Define a volume in memory
  const volumeId = "streamingImageVolume"
  const volume = await volumeLoader.createAndCacheVolume(volumeId, {
    imageIds,
  })

  // Set the volume to load
  volume.load()

  // Set the volume on the viewport
  viewport.setVolumes([{ volumeId }])

  // Render the image
  viewport.render()
}

// Run setup on mount
onMounted(() => {
  setup()
})
</script>

<template>
  <div
    ref="elementRef"
    style="width: 512px; height: 512px; background-color: #000"
  ></div>
</template>
