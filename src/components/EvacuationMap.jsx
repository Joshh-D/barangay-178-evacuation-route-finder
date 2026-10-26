import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from 'react-leaflet'
import { divIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

const BARANGAY_CENTER = [14.7555, 121.0585]


const makeMapIcon = (emoji, background) =>
  divIcon({
    className: 'custom-evacuation-marker',
    html: `<div style="width:40px;height:40px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${background};border:3px solid white;box-shadow:0 2px 8px rgba(15,23,42,.35);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:19px;line-height:1">${emoji}</span></div>`,
    iconSize: [40, 44],
    iconAnchor: [20, 42],
    popupAnchor: [0, -40],
  })

const START_ICON = makeMapIcon('📍', '#2563eb')
const SHELTER_ICON = makeMapIcon('🏟️', '#059669')
const HALL_ICON = makeMapIcon('🏢', '#7c3aed')
const FIRE_ICON = makeMapIcon('🚒', '#dc2626')
const POLICE_ICON = makeMapIcon('🚓', '#1d4ed8')

function getFacilityIcon(place) {
  if (place.type === 'Fire and Rescue') return FIRE_ICON
  if (place.type === 'Police Precinct') return POLICE_ICON
  if (place.type === 'Barangay Hall') return HALL_ICON
  return SHELTER_ICON
}

const photoUrl = (folder, filename) =>
  `/Images/${[folder, filename].map((part) => encodeURIComponent(part)).join('/')}`

const LOCATION_PHOTOS = {
  court1: [
    {
      title: 'ADCNAI Covered Court',
      image: photoUrl('ADCNAI Covered Court', 'images.jpg'),
      source: photoUrl('ADCNAI Covered Court', 'images.jpg'),
      sourceName: 'Gathered photos saved in local device',
    },
  ],
  court2: [
    {
      title: 'Purok Laloma Covered Court — Photo 1',
      image: photoUrl('Purok Laloma Covered Court', 'images (1).jpg'),
      source: photoUrl('Purok Laloma Covered Court', 'images (1).jpg'),
      sourceName: 'Gathered photos saved in local device',
    },
    {
      title: 'Purok Laloma Covered Court — Photo 2',
      image: photoUrl('Purok Laloma Covered Court', 'images.jpg'),
      source: photoUrl('Purok Laloma Covered Court', 'images.jpg'),
      sourceName: 'Gathered photos saved in local device',
    },
  ],
  smmi: [
    {
      title: 'SMMI Covered Court',
      image: photoUrl('SMMI Covered Court', 'images (2).jpg'),
      source: photoUrl('SMMI Covered Court', 'images (2).jpg'),
      
    },
  ],
  laloma: [
    {
      title: 'Laloma Covered Court — Photo 1',
      image: photoUrl('Laloma Covered Court', '01_big.jpg'),
      source: photoUrl('Laloma Covered Court', '01_big.jpg'),
      sourceName: 'Photo gathered saved locally',
    },
    {
      title: 'Laloma Covered Court — Photo 2',
      image: photoUrl('Laloma Covered Court', '02_big.jpg'),
      source: photoUrl('Laloma Covered Court', '02_big.jpg'),
      sourceName: 'Gathered photos saved in local device',
    },
  ],
  purok: [
    {
      title: 'Purok Covered Court',
      image: photoUrl('Purok Covered Court', 'images (1).jpg'),
      source: photoUrl('Purok Covered Court', 'images (1).jpg'),
      sourceName: 'Gathered photos saved in local device',
    },
  ],
  pinagbuklod: [
    {
      title: 'Pinagbuklod Multipurpose Building',
      image: photoUrl('Pinagbuklod Multipurpose Building', 'images.jpg'),
      source: photoUrl('Pinagbuklod Multipurpose Building', 'images.jpg'),
      sourceName: 'Gathered photos saved in local device',
    },
  ],
  hall: [
    {
      title: 'Barangay 178 Hall',
      image: photoUrl('Barangay 178 Hall', 'images.jpg'),
      source: photoUrl('Barangay 178 Hall', 'images.jpg'),
      sourceName: 'Gathered photos saved in local device',
    },
  ],
  fire178: [
    {
      title: 'Barangay 178 Fire & Rescue Brigade — Photo 1',
      image: photoUrl(
        'Barangay 178 Fire & Rescue Brigade',
        '843758478_122140040247356010_6393138286080092060_n.jpg',
      ),
      source: photoUrl(
        'Barangay 178 Fire & Rescue Brigade',
        '843758478_122140040247356010_6393138286080092060_n.jpg',
      ),
      sourceName: 'Gathered photos saved in local device',
    },
    {
      title: 'Barangay 178 Fire & Rescue Brigade — Photo 2',
      image: photoUrl(
        'Barangay 178 Fire & Rescue Brigade',
        '846375259_122140040277356010_1989311892965350708_n.jpg',
      ),
      source: photoUrl(
        'Barangay 178 Fire & Rescue Brigade',
        '846375259_122140040277356010_1989311892965350708_n.jpg',
      ),
      sourceName: 'Gathered photos saved in local device',
    },
  ],
  pcp5: [],
}

const LOCATION_PHOTO_SOURCES = {
  court1: {
    label: 'ADCNAI Covered Court listing',
    url: 'https://www.waze.com/live-map/directions/ph/ncr/caloocan/adcnai-covered-court?to=place.ChIJ69PrKrSxlzMRnza8d2ELHsY',
  },
  court2: {
    label: 'Purok Laloma Covered Court listing',
    url: 'https://www.courtsoftheworld.com/es/philippines/caloocan/purok-laloma-covered-court/',
  },
  smmi: {
    label: 'SMMI Covered Court map listing',
    url: 'https://www.google.com/maps/search/?api=1&query=SMMI+Covered+Court+Camarin+Caloocan',
  },
  laloma: {
    label: 'Search for this location on Google Maps',
    url: 'https://www.google.com/maps/search/?api=1&query=Laloma+Covered+Court+Barangay+178+Caloocan',
  },
  purok: {
    label: 'Search for this location on Google Maps',
    url: 'https://www.google.com/maps/search/?api=1&query=Purok+Covered+Court+Barangay+178+Caloocan',
  },
  pinagbuklod: {
    label: 'Search for this location on Google Maps',
    url: 'https://www.google.com/maps/search/?api=1&query=Pinagbuklod+Multipurpose+Building+Camarin+Caloocan',
  },
  hall: {
    label: 'Barangay 178 information and photos',
    url: 'https://www.findglocal.com/PH/Caloocan/304661380238317/Barangay-178-Camarin-Caloocan-City-Zone-16-Dist.-III',
  },
  fire178: {
    label: 'Search for this location on Google Maps',
    url: 'https://www.google.com/maps/search/?api=1&query=Barangay+178+Fire+Rescue+Brigade+Caloocan',
  },
  pcp5: {
    label: 'Search for this location on Google Maps',
    url: 'https://www.google.com/maps/search/?api=1&query=Police+Community+Precinct+5+Caloocan',
  },
}

const BARANGAY_BOUNDS = [
  [14.749, 121.045],
  [14.761, 121.067],
]

const DESTINATIONS = [
  {
    id: 'court1',
    name: 'ADCNAI Covered Court',
    type: 'Covered Court',
    position: [14.7535, 121.0465],
    capacity: 150,
    capacityLabel: '150 people (estimated)',
    isShelter: true,
    description:
      'Community covered court. The estimated comfortable capacity is 150 people. Confirm its evacuation designation and safe occupancy with barangay officials.',
    facilities: ['Covered area', 'Community gathering space'],
  },
  {
    id: 'court2',
    name: 'Purok Laloma Covered Court',
    type: 'Covered Court',
    position: [14.7519, 121.0525],
    capacity: 150,
    capacityLabel: '150 people (estimated)',
    isShelter: true,
    description:
      'Community covered court. The estimated comfortable capacity is 150 people. Confirm its evacuation designation and safe occupancy with barangay officials.',
    facilities: ['Covered area', 'Community gathering space'],
  },
  {
    id: 'smmi',
    name: 'SMMI Covered Court',
    type: 'Covered Court',
    position: [14.7555, 121.0585],
    capacity: 200,
    capacityLabel: '200 people (estimated)',
    isShelter: true,
    description:
      'Community covered court. The estimated comfortable capacity is 200 people. Confirm the exact location, evacuation designation, and safe occupancy with barangay officials.',
    facilities: ['Covered area', 'Community gathering space'],
  },
  {
    id: 'laloma',
    name: 'Laloma Covered Court',
    type: 'Covered Court',
    position: [14.7525, 121.0545],
    capacity: 150,
    capacityLabel: '150 people (estimated)',
    isShelter: true,
    description:
      'Community covered court listed in public infrastructure information. Capacity is a sample estimate; verify the exact facility and approved occupancy.',
    facilities: ['Covered area', 'Community gathering space'],
  },
  {
    id: 'purok',
    name: 'Purok Covered Court',
    type: 'Covered Court',
    position: [14.7545, 121.0560],
    capacity: 100,
    capacityLabel: '100 people (estimated)',
    isShelter: true,
    description:
      'A neighborhood covered-court entry included for this prototype. Verify the facility name, exact location, and evacuation status with barangay officials.',
    facilities: ['Covered area', 'Community gathering space'],
  },
  {
    id: 'pinagbuklod',
    name: 'Pinagbuklod Multipurpose Building',
    type: 'Multipurpose Building',
    position: [14.7535, 121.0560],
    capacity: 80,
    capacityLabel: '80 people (estimated)',
    isShelter: true,
    description:
      'Multipurpose building listed in public project information. The capacity is a sample estimate; verify whether this building is an approved evacuation site.',
    facilities: ['Multipurpose space'],
    contactLabel: 'Multipurpose Building Contact',
    contactDisplay: '+63 956 328 1433',
    contactTel: '+639563281433',
  },
  {
    id: 'hall',
    name: 'Barangay 178 Hall',
    type: 'Barangay Hall',
    position: [14.7545, 121.0505],
    capacity: 40,
    capacityLabel: '40 people (estimated)',
    isShelter: false,
    description:
      'Local government office for barangay coordination and emergency information. This estimate is for general indoor occupancy, not a confirmed evacuation capacity.',
    facilities: ['Barangay coordination', 'Emergency information'],
    contactLabel: 'Barangay 178 Hall Contact',
    contactDisplay: '+63 928 497 1332',
    contactTel: '+639284971332',
  },
  {
    id: 'fire178',
    name: 'Barangay 178 Fire & Rescue Brigade',
    type: 'Fire and Rescue',
    position: [14.7560, 121.0565],
    capacity: 20,
    capacityLabel: '20 personnel (estimated)',
    isShelter: false,
    description:
      'Listed barangay-based fire and rescue service. This is an emergency-response facility, not an evacuation shelter. Verify the exact pin and facility details.',
    facilities: ['Fire and rescue assistance'],
    contactLabel: 'Fire & Rescue Hotline',
    contactDisplay: '888-ALONG (25664)',
    contactTel: null,
  },
  {
    id: 'pcp5',
    name: 'Police Community Precinct 5 (PCP 5)',
    type: 'Police Station',
    position: [14.7580, 121.0520],
    capacity: 20,
    capacityLabel: '20 personnel (estimated)',
    isShelter: false,
    description:
      'Police precinct documented as serving Barangays 173–178. This is an emergency service, not an evacuation shelter. Verify its exact location before relying on directions.',
    facilities: ['Police assistance', 'Incident reporting'],
    contactLabel: 'Police Contact',
    contactDisplay: '+63 961 913 4581',
    contactTel: '+639619134581',
  },
]

function distanceKm(a, b) {
  const rad = (degrees) => (degrees * Math.PI) / 180
  const dLat = rad(b[0] - a[0])
  const dLon = rad(b[1] - a[1])

  const value =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a[0])) *
      Math.cos(rad(b[0])) *
      Math.sin(dLon / 2) ** 2

  return 6371 * 2 * Math.atan2(
    Math.sqrt(value),
    Math.sqrt(1 - value),
  )
}

function formatStepDistance(meters) {
  const distance = Number(meters)
  if (!Number.isFinite(distance) || distance < 0) return 'Distance unavailable'
  if (distance < 1000) return `${Math.round(distance)} m`
  return `${(distance / 1000).toFixed(2)} km`
}

function getManeuverArrow(step) {
  const type = String(step?.maneuver?.type || '').toLowerCase()
  const modifier = String(step?.maneuver?.modifier || '').toLowerCase()

  if (type === 'arrive') return '⚑'
  if (type.includes('roundabout') || type === 'rotary') return '⟳'
  if (type.includes('uturn') || modifier.includes('uturn')) return '↶'
  if (modifier.includes('sharp left')) return '⬅'
  if (modifier.includes('slight left')) return '↖'
  if (modifier === 'left') return '↰'
  if (modifier.includes('sharp right')) return '➡'
  if (modifier.includes('slight right')) return '↗'
  if (modifier === 'right') return '↱'
  if (type === 'merge' || type === 'ramp') return modifier.includes('left') ? '↖' : '↗'
  if (type === 'fork') return modifier.includes('left') ? '↖' : modifier.includes('right') ? '↗' : '↑'
  return '↑'
}

function getStepInstruction(step) {
  const maneuver = step?.maneuver || {}
  const type = String(maneuver.type || 'continue').toLowerCase()
  const modifier = String(maneuver.modifier || '').replace(/-/g, ' ').toLowerCase()
  const street = String(step?.name || '').trim()
  const road = street || 'an unnamed road'
  const turnWord = modifier || 'ahead'

  switch (type) {
    case 'depart':
      return street ? `Start on ${street}` : 'Start along the road'
    case 'arrive':
      return 'Arrive at your selected destination'
    case 'turn':
      return `Turn ${turnWord} onto ${road}`
    case 'continue':
      if (modifier && modifier !== 'straight' && modifier !== 'uturn') {
        return `Continue ${modifier} onto ${road}`
      }
      return street ? `Continue on ${street}` : 'Continue straight along the road'
    case 'merge':
      return `Merge ${modifier || 'onto the road'}${street ? ` onto ${street}` : ''}`
    case 'on ramp':
    case 'ramp':
      return `Take the ramp${modifier ? ` ${modifier}` : ''}${street ? ` toward ${street}` : ''}`
    case 'off ramp':
      return `Take the exit${modifier ? ` ${modifier}` : ''}${street ? ` toward ${street}` : ''}`
    case 'fork':
      return `At the fork, keep ${modifier || 'straight'}${street ? ` onto ${street}` : ' on the road'}`
    case 'end of road':
      return `At the end of the road, turn ${modifier || 'ahead'}${street ? ` onto ${street}` : ''}`
    case 'roundabout':
    case 'roundabout turn':
    case 'rotary':
      return `Enter the roundabout${street ? ` toward ${street}` : ''}`
    case 'exit roundabout':
    case 'exit rotary':
      return `Exit the roundabout${street ? ` onto ${street}` : ''}`
    default:
      return street ? `Continue on ${street}` : 'Continue along the road'
  }
}

function MapInteractions({ onDoubleClick }) {
  useMapEvents({
    dblclick(event) {
      const { lat, lng } = event.latlng
      const [[south, west], [north, east]] = BARANGAY_BOUNDS

      if (
        lat < south ||
        lat > north ||
        lng < west ||
        lng > east
      ) {
        return
      }

      onDoubleClick([lat, lng])
    },
  })

  return null
}

function MapFocus({ origin, destination }) {
  const map = useMap()

  useEffect(() => {
    if (origin && destination) {
      map.fitBounds([origin, destination], {
        padding: [40, 40],
        maxZoom: 17,
      })
    }
  }, [map, origin, destination])

  return null
}


export default function EvacuationMap() {
  const [origin, setOrigin] = useState(null)
  const [pendingOrigin, setPendingOrigin] = useState(null)
  const [selectedId, setSelectedId] = useState('')
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [routes, setRoutes] = useState([])
  const [routeSteps, setRouteSteps] = useState([])
  const [directionsOpen, setDirectionsOpen] = useState(false)
  const [routeDistance, setRouteDistance] = useState(null)
  const [destinationDropdownOpen, setDestinationDropdownOpen] = useState(false)
  const [routeStatus, setRouteStatus] = useState('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [destinationNeeded, setDestinationNeeded] = useState(false)
  const [showReachedModal, setShowReachedModal] = useState(false)
  const [reachedFadeOut, setReachedFadeOut] = useState(false)

  useEffect(() => {
    if (routeStatus !== 'reached') return undefined

    setReachedFadeOut(false)
    const fadeTimer = window.setTimeout(() => {
      setReachedFadeOut(true)
    }, 5000)

    const clearTimer = window.setTimeout(() => {
      setSelectedPlace(null)
      setSelectedId('')
      setRoutes([])
      setRouteSteps([])
      setRouteDistance(null)
      setDirectionsOpen(false)
      setDestinationDropdownOpen(false)
      setDestinationNeeded(false)
      setRouteStatus('idle')
      setReachedFadeOut(false)
    }, 5700)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(clearTimer)
    }
  }, [routeStatus])

  function confirmDestinationReached() {
    setShowReachedModal(true)
  }

  function handleDestinationReached() {
    setRoutes([])
    setRouteSteps([])
    setRouteDistance(null)
    setRouteStatus('reached')
    setReachedFadeOut(false)
    setError('')
    setShowReachedModal(false)
  }


  const selectedDestination = DESTINATIONS.find(
    (place) => place.id === selectedId,
  )

  function selectDestination(place) {
    setDestinationDropdownOpen(false)
    setSelectedId(place.id)
    setSelectedPlace(place)
    setDirectionsOpen(true)
    setRoutes([])
    setRouteSteps([])
    setRouteDistance(null)
    setRouteStatus('idle')
    setReachedFadeOut(false)
    setShowReachedModal(false)
    setError('')
  }

 function confirmOrigin() {
  if (!pendingOrigin) return

  setOrigin(pendingOrigin)
  setPendingOrigin(null)
  setRoutes([])
  setRouteSteps([])
  setRouteDistance(null)
  setDirectionsOpen(false)
  setDestinationDropdownOpen(false)
  setRouteStatus('idle')
  setReachedFadeOut(false)
  setShowReachedModal(false)
  setSelectedPlace(null)
  setSelectedId('')
  setError('')
  setDestinationNeeded(true)

  // Scroll back to the destination selection area.
  setTimeout(() => {
    document
      .getElementById('evacuation-destination')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
  }, 100)
}
  async function findRoute(destinationOverride = null) {
    // Only accept an actual destination object as an override. React click
    // handlers pass a MouseEvent, so using onClick={findRoute} directly would
    // accidentally treat that event as the destination and produce an
    // "undefined does not have valid map coordinates" error.
    const suppliedDestination =
      destinationOverride &&
      typeof destinationOverride === 'object' &&
      Array.isArray(destinationOverride.position)
        ? destinationOverride
        : null
    const destination = suppliedDestination || selectedDestination

    if (!origin) {
      setError('Double-click your starting point on the map first, then confirm it.')
      return
    }

    if (!destination || !destination.name) {
      setError('Please select a destination from the dropdown or click a location marker.')
      return
    }

    setLoading(true)
    setError('')
    setRoutes([])
    setRouteSteps([])
    setDirectionsOpen(true)
    setRouteDistance(null)
    setRouteStatus('idle')

    try {
      const isValidCoordinatePair = (value) =>
        Array.isArray(value) &&
        value.length >= 2 &&
        Number.isFinite(Number(value[0])) &&
        Number.isFinite(Number(value[1]))

      if (!isValidCoordinatePair(origin)) {
        throw new Error('Your starting point is missing or has invalid coordinates. Double-click the map and confirm it again.')
      }

      if (!isValidCoordinatePair(destination.position)) {
        throw new Error(`${destination.name} does not have valid map coordinates. Please check that location's position in the destination list.`)
      }

      const [startLat, startLon] = origin.map(Number)
      const [endLat, endLon] = destination.position.map(Number)

      // Request one route only. The nearest-shelter dropdown option chooses
      // the closest listed shelter by straight-line distance before routing.
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${startLon},${startLat};${endLon},${endLat}` +
        '?alternatives=false&steps=true&overview=full&geometries=geojson'

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`The routing service returned HTTP ${response.status}. Please try again in a moment.`)
      }

      const data = await response.json()
      if (data?.code !== 'Ok' || !Array.isArray(data?.routes) || data.routes.length === 0) {
        const serviceMessage = typeof data?.message === 'string' ? ` ${data.message}` : ''
        throw new Error(`No road route was found for ${destination.name}.${serviceMessage} Check the destination coordinates or try again later.`)
      }

      const item = data.routes[0]
      const coordinates = item?.geometry?.coordinates
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        throw new Error(`The routing service did not return usable road coordinates for ${destination.name}.`)
      }

      const positions = coordinates
        .filter((coordinate) =>
          Array.isArray(coordinate) &&
          coordinate.length >= 2 &&
          Number.isFinite(Number(coordinate[0])) &&
          Number.isFinite(Number(coordinate[1])),
        )
        .map((coordinate) => [Number(coordinate[1]), Number(coordinate[0])])

      if (
        positions.length < 2 ||
        !Number.isFinite(Number(item?.distance)) ||
        !Number.isFinite(Number(item?.duration))
      ) {
        throw new Error(`The routing service returned incomplete route data for ${destination.name}. Please try again.`)
      }

      const routeOption = {
        positions,
        distanceKm: Number(item.distance) / 1000,
        durationMinutes: Number(item.duration) / 60,
      }

      const rawSteps = Array.isArray(item?.legs)
        ? item.legs.flatMap((leg) => Array.isArray(leg?.steps) ? leg.steps : [])
        : []
      const usableSteps = rawSteps.filter((step) => {
        const location = step?.maneuver?.location
        return Array.isArray(location) && location.length >= 2 &&
          Number.isFinite(Number(location[0])) && Number.isFinite(Number(location[1]))
      })

      setRoutes([routeOption])
      setRouteSteps(usableSteps)
      setDirectionsOpen(true)
      setRouteDistance(routeOption.distanceKm)
      setRouteStatus('active')
    } catch (err) {
      console.error('Evacuation routing error:', err)
      setError(
        err instanceof TypeError && /fetch/i.test(err.message)
          ? 'Could not connect to the routing service. Check your internet connection and try again.'
          : (err?.message || 'An unexpected error occurred while calculating the route.'),
      )
      setRoutes([])
      setRouteSteps([])
      setRouteDistance(null)
      setRouteStatus('idle')
    } finally {
      setLoading(false)
    }
  }

  function selectNearestShelter() {
    setDestinationDropdownOpen(false)

    if (!origin) {
      setError('Set and confirm your starting point on the map first to find the nearest shelter.')
      return
    }

    const shelters = DESTINATIONS.filter((place) => place.isShelter)
    if (!shelters.length) {
      setError('No evacuation shelters are currently listed.')
      return
    }

    const nearest = shelters.reduce((best, place) => {
      return distanceKm(origin, place.position) < distanceKm(origin, best.position)
        ? place
        : best
    }, shelters[0])

    selectDestination(nearest)
    setDestinationNeeded(false)
    setError('')
    // Pass the destination directly so this works immediately without waiting
    // for React state to update after selectDestination.
    void findRoute(nearest)
  }


  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-bold">Find an Evacuation Route</h3>

        <p className="mt-1 text-sm text-slate-600">
          Double-click your starting point on the map and confirm it. Then choose a destination and find a route. Turn-by-turn directions slide open inside the right side of the map.
        </p>

        <label
          className="mt-4 block text-sm font-semibold"
        >
          Choose destination
        </label>


<div id="evacuation-destination" className="relative mt-2">
  <button
    type="button"
    aria-haspopup="listbox"
    aria-expanded={destinationDropdownOpen}
    onClick={() => setDestinationDropdownOpen((open) => !open)}
    className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-white p-3 text-left transition-colors ${
      destinationNeeded && !selectedId
        ? 'border-red-500 ring-2 ring-red-200 focus:border-red-600 focus:ring-red-200'
        : 'border-slate-300 hover:border-slate-400'
    }`}
  >
    <span
      className={`transition-opacity duration-700 ease-in-out ${
        selectedDestination ? 'text-slate-900' : 'text-slate-500'
      } ${routeStatus === 'reached' && reachedFadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      {selectedDestination ? selectedDestination.name : 'Select a destination'}
    </span>
    <span className="text-slate-500" aria-hidden="true">{destinationDropdownOpen ? '▲' : '▼'}</span>
  </button>

  {destinationDropdownOpen && (
    <div
      role="listbox"
      aria-label="Evacuation destinations"
      className="absolute z-[1200] mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl"
    >
      <button
        type="button"
        role="option"
        aria-selected={false}
        onClick={selectNearestShelter}
        className="w-full rounded-md bg-blue-50 px-3 py-3 text-left hover:bg-blue-100"
      >
        <span className="block font-semibold text-blue-800">Find the nearest evacuation shelter</span>
        <span className="mt-1 block text-xs text-slate-500">Automatically selects the closest listed shelter and calculates a route</span>
      </button>

      <div className="my-1 border-t border-slate-100" />
      {DESTINATIONS.map((place) => {
        const km = origin ? distanceKm(origin, place.position) : null
        return (
          <button
            key={place.id}
            type="button"
            role="option"
            aria-selected={selectedId === place.id}
            onClick={() => {
              selectDestination(place)
              setDestinationDropdownOpen(false)
              setDestinationNeeded(false)
            }}
            className={`w-full rounded-md px-3 py-2.5 text-left hover:bg-slate-50 ${
              selectedId === place.id ? 'bg-blue-50' : 'bg-white'
            }`}
          >
            <span className="block font-medium text-slate-900">{place.name}</span>
            {km !== null && (
              <span className="mt-0.5 block text-xs text-slate-500">
                {km.toFixed(2)} km straight-line distance
              </span>
            )}
            {!place.isShelter && (
              <span className="mt-0.5 block text-xs text-amber-700">Emergency service, not an evacuation shelter</span>
            )}
          </button>
        )
      })}
    </div>
  )}
</div>

{destinationNeeded && !selectedId && (
  <p
    id="destination-required-message"
    className="mt-2 text-sm font-semibold text-red-600"
  >
    Please select an evacuation destination to continue.
  </p>
)}

        


{routes.length > 0 ? (
  <button
    onClick={confirmDestinationReached}
    className="mt-4 w-full rounded-lg bg-emerald-700 p-3 font-bold text-white hover:bg-emerald-800"
  >
    Destination Reached
  </button>
) : (
  <button
    onClick={() => findRoute()}
    disabled={loading}
    className="mt-4 w-full rounded-lg bg-emerald-700 p-3 font-bold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
  >
    {loading ? 'Finding route...' : 'Find Evacuation Route'}
  </button>
)}


{routeStatus === 'reached' && (
  <p
    role="status"
    aria-live="polite"
    className={`mt-3 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 transition-opacity duration-700 ease-in-out ${
      reachedFadeOut ? 'opacity-0' : 'opacity-100'
    }`}
  >
    Destination reached! Your route has been cleared.
  </p>
)}



        {routeDistance !== null && (
          <p className="mt-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
            Road route distance: <strong>{routeDistance.toFixed(2)} km</strong>
          </p>
        )}

        {error && (
          <p role="alert" className="mt-3 text-sm text-red-700">
            {error}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-bold text-slate-900">Important Contact Numbers</h3>
        <p className="mt-1 text-sm text-slate-600">Reach out in case of emergency.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Barangay 178 Hall</p>
<p className="mt-1 inline-block font-bold text-emerald-700 underline underline-offset-2">
  +63 928 497 1332
</p>          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Fire &amp; Rescue</p>
            <p className="mt-1 font-bold text-emerald-700">888-ALONG (25664)</p>
          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Police Community Precinct 5</p>
<p className="mt-1 inline-block font-bold text-emerald-700 underline underline-offset-2">
  +63 961 913 4581
</p>          </div>
          <div className="rounded-lg border border-slate-200 p-3">
            <p className="text-sm font-semibold text-slate-800">Multipurpose Building</p>
<p className="mt-1 inline-block font-bold text-emerald-700 underline underline-offset-2">
  +63 956 328 1433
</p>          </div>
        </div>
      </section>

      <div className="relative h-[600px] w-full overflow-hidden rounded-xl border border-slate-200">
     
<MapContainer
  center={BARANGAY_CENTER}
  zoom={17}
  minZoom={17}
  maxZoom={18}
  maxBounds={BARANGAY_BOUNDS}
  maxBoundsViscosity={1.0}
  className="h-full w-full"
>

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapInteractions
            onDoubleClick={(position) => setPendingOrigin(position)}
          />

          {origin && (
            <Marker position={origin} icon={START_ICON}>
              <Popup>Your confirmed starting location</Popup>
            </Marker>
          )}

          {DESTINATIONS.map((place) => (
            <Marker
              key={place.id}
              position={place.position}
              icon={getFacilityIcon(place)}
              eventHandlers={{
                click: () => selectDestination(place),
              }}
            >
              <Popup>
                <strong>{place.name}</strong>
                <br />
                {place.type}
                <br />
                Capacity: {place.capacityLabel}
              </Popup>
            </Marker>
          ))}

          {routes.length > 0 && (
            <Polyline
              positions={routes[0].positions}
              pathOptions={{
                color: '#2563eb',
                weight: 7,
                opacity: 0.95,
              }}
            />
          )}

          <MapFocus
            origin={origin}
            destination={routes.length ? selectedDestination?.position : null}
          />
        </MapContainer>

        {/* This drawer is positioned inside the map container, so it never covers the whole website. */}
        <aside
          aria-label="Turn-by-turn directions"
          aria-hidden={!directionsOpen}
          className={`absolute inset-y-0 right-0 z-[1200] flex w-[84%] min-w-[260px] max-w-[400px] flex-col border-l border-slate-200 bg-white shadow-2xl transition-[transform,opacity] duration-700 ease-in-out sm:w-1/2 lg:w-1/4 ${
            directionsOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
          } ${routeStatus === 'reached' && reachedFadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200 p-4">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Route guide</p>
              <h3 className="mt-1 text-base font-bold text-slate-900">Turn-by-turn directions</h3>
              <p className="mt-1 truncate text-xs text-slate-500">
                {selectedDestination?.name || 'Select a destination'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDirectionsOpen(false)}
              className="shrink-0 rounded-md border border-slate-200 px-2.5 py-1.5 text-slate-600 hover:bg-slate-100"
              aria-label="Close turn-by-turn directions"
              title="Close directions"
            >
              →
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {loading && (
              <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
                Calculating the road directions…
              </div>
            )}

            {!loading && !origin && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Double-click the map to set your starting point, confirm it, and then calculate a route. Your turn list will appear here.
              </div>
            )}

            {!loading && origin && routes.length === 0 && !error && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Your destination is selected. Press <strong>Find Evacuation Route</strong> above the map to load the road turns and street names here.
              </div>
            )}

            {!loading && error && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">
                Directions are unavailable until a road route can be calculated. {error}
              </div>
            )}

            {!loading && routes.length > 0 && routeSteps.length === 0 && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                The road route was found, but the routing service did not provide detailed turn steps for this route.
              </div>
            )}

            {routeSteps.length > 0 && (
              <ol className="divide-y divide-slate-100">
                {routeSteps.map((step, index) => {
                  const streetName = String(step?.name || '').trim()
                  const distanceLabel = formatStepDistance(step?.distance)
                  const arrow = getManeuverArrow(step)
                  return (
                    <li key={`${index}-${step?.maneuver?.type || 'step'}-${streetName}`} className="flex gap-3 py-3 first:pt-1 last:pb-1">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xl font-bold text-emerald-700" aria-hidden="true">
                        {arrow}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-5 text-slate-900">
                          {getStepInstruction(step)}
                        </p>
                        <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                          Street: {streetName || 'Street name unavailable from map data'}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-emerald-700">
                          Continue for {distanceLabel}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>

          {routes.length > 0 && routeDistance !== null && (
            <div className="shrink-0 border-t border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Total road distance</p>
              <p className="text-lg font-bold text-slate-900">{routeDistance.toFixed(2)} km</p>
              <p className="text-xs text-slate-500">Turn instructions are based on the routing service's road data.</p>
            </div>
          )}
        </aside>

        {!directionsOpen && selectedPlace && (
          <button
            type="button"
            onClick={() => setDirectionsOpen(true)}
            className="absolute right-0 top-4 z-[1201] flex items-center gap-2 rounded-l-lg bg-white px-3 py-3 text-sm font-bold text-emerald-800 shadow-lg ring-1 ring-slate-200 transition hover:bg-emerald-50"
            aria-label="Open turn-by-turn directions panel"
          >
            <span aria-hidden="true">←</span> Directions
          </button>
        )}
      </div>

      {selectedPlace && (
        <section
          className={`scroll-mt-6 rounded-xl border border-slate-200 bg-white p-5 transition-opacity duration-700 ease-in-out ${
            routeStatus === 'reached' && reachedFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-emerald-700">
                {selectedPlace.type}
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {selectedPlace.name}
              </h3>
            </div>

            <button
              onClick={() => {
                setSelectedPlace(null)
                setSelectedId('')
                setDirectionsOpen(false)
              }}
              className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
              aria-label="Close destination details"
            >
              ✕
            </button>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-semibold text-slate-800">Location photos</h4>
              <span className="text-xs text-slate-500">
                Up to 3 photos
              </span>
            </div>

            {LOCATION_PHOTOS[selectedPlace.id]?.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {LOCATION_PHOTOS[selectedPlace.id].slice(0, 3).map((photo) => (
                  <figure key={photo.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <a href={photo.source} target="_blank" rel="noreferrer" aria-label={`Open source for ${photo.title}`}>
                      <img
                        src={photo.image}
                        alt={`${photo.title} — ${selectedPlace.name}`}
                        loading="lazy"
                        className="h-44 w-full object-cover transition-transform duration-200 hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.closest('figure')?.remove()
                        }}
                      />
                    </a>
                    <figcaption className="p-3">
                      <p className="text-sm font-medium text-slate-800">{photo.title}</p>
                      <a href={photo.source} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-emerald-700 underline underline-offset-2">
                        Source: {photo.sourceName}
                      </a>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No photos
              </p>
            )}
          </div>

          {selectedPlace.contactDisplay && (
            <div className="mt-4 rounded-lg bg-emerald-50 p-3">
              <p className="text-sm font-semibold text-emerald-900">{selectedPlace.contactLabel || 'Contact number'}</p>
              {selectedPlace.contactTel ? (
                <a href={`tel:${selectedPlace.contactTel}`} className="mt-1 inline-block font-bold text-emerald-800 underline underline-offset-2">
                  {selectedPlace.contactDisplay}
                </a>
              ) : (
                <p className="mt-1 font-bold text-emerald-800">{selectedPlace.contactDisplay}</p>
              )}
            </div>
          )}

          <p className="mt-4 text-sm text-slate-600">
            <strong>Estimated facility capacity:</strong>{' '}
            {selectedPlace.capacityLabel}
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {selectedPlace.description}
          </p>

          {selectedPlace.facilities?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-semibold text-slate-700">
                Facility information
              </p>
              <ul className="mt-1 list-inside list-disc text-sm text-slate-600">
                {selectedPlace.facilities.map((facility) => (
                  <li key={facility}>{facility}</li>
                ))}
              </ul>
            </div>
          )}

          {!selectedPlace.isShelter && (
            <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              This is an emergency-service location, not an evacuation shelter.
            </p>
          )}

          <p className="mt-3 text-xs leading-5 text-slate-500">
            Capacity figures and some destination pins are sample estimates.
            Confirm the actual location, shelter status, and safe occupancy
            with barangay officials.
          </p>
        </section>
      )}

      {pendingOrigin && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-location-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="confirm-location-title" className="text-xl font-bold">
              Confirm your starting location
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Do you want to set the location you double-clicked as your
              current starting point?
            </p>

            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              Latitude: {pendingOrigin[0].toFixed(6)}
              <br />
              Longitude: {pendingOrigin[1].toFixed(6)}
            </p>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setPendingOrigin(null)}
                className="flex-1 rounded-lg border border-slate-300 p-3 font-semibold hover:bg-slate-50"
              >
                No, cancel
              </button>

              <button
                onClick={confirmOrigin}
                className="flex-1 rounded-lg bg-emerald-700 p-3 font-semibold text-white hover:bg-emerald-800"
              >
                Yes, confirm
              </button>
            </div>
          </div>
        </div>

        
      )}
      
{showReachedModal && (
  <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4">
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-reached-title"
      className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
    >
      <h2 id="confirm-reached-title" className="text-xl font-bold">
        Confirm destination reached
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        Have you reached your selected evacuation destination? Confirming
        will clear your current route.
      </p>

      <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
        Destination: {selectedPlace?.name ?? 'Selected destination'}
      </p>

      <div className="mt-5 flex gap-3">
        <button
          onClick={() => setShowReachedModal(false)}
          className="flex-1 rounded-lg border border-slate-300 p-3 font-semibold hover:bg-slate-50"
        >
          No, go back
        </button>

        <button
          onClick={handleDestinationReached}
          className="flex-1 rounded-lg bg-emerald-700 p-3 font-semibold text-white hover:bg-emerald-800"
        >
          Yes, confirm
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  )
}
