import { useState, useEffect } from 'react';
import { Building2, MapPin, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Country subdivision mapping for USA, UK, AUS, NZ
const countrySubdivisionMapping = {
  USA: {
    name: 'United States',
    label: 'State',
    options: [
      'Alabama',
      'Alaska',
      'Arizona',
      'Arkansas',
      'California',
      'Colorado',
      'Connecticut',
      'Delaware',
      'Florida',
      'Georgia',
      'Hawaii',
      'Idaho',
      'Illinois',
      'Indiana',
      'Iowa',
      'Kansas',
      'Kentucky',
      'Louisiana',
      'Maine',
      'Maryland',
      'Massachusetts',
      'Michigan',
      'Minnesota',
      'Mississippi',
      'Missouri',
      'Montana',
      'Nebraska',
      'Nevada',
      'New Hampshire',
      'New Jersey',
      'New Mexico',
      'New York',
      'North Carolina',
      'North Dakota',
      'Ohio',
      'Oklahoma',
      'Oregon',
      'Pennsylvania',
      'Rhode Island',
      'South Carolina',
      'South Dakota',
      'Tennessee',
      'Texas',
      'Utah',
      'Vermont',
      'Virginia',
      'Washington',
      'West Virginia',
      'Wisconsin',
      'Wyoming',
    ],
  },
  UK: {
    name: 'United Kingdom',
    label: 'Region',
    options: ['England', 'Northern Ireland', 'Scotland', 'Wales'],
  },
  AUS: {
    name: 'Australia',
    label: 'State/Territory',
    options: [
      'New South Wales',
      'Victoria',
      'Queensland',
      'South Australia',
      'Western Australia',
      'Tasmania',
      'Northern Territory',
      'Australian Capital Territory',
    ],
  },
  NZ: {
    name: 'New Zealand',
    label: 'Region',
    options: [
      'Auckland',
      'Bay of Plenty',
      'Canterbury',
      'Gisborne',
      "Hawke's Bay",
      'Manawatu-Whanganui',
      'Marlborough',
      'Nelson',
      'Otago',
      'Southland',
      'Taranaki',
      'Tasman',
      'Waikato',
      'Wellington',
      'West Coast',
    ],
  },
};

// Mapping from subdivision (state/region) to cities for each country.
const cityMapping = {
  USA: {
    Alabama: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville'],
    Alaska: ['Anchorage', 'Fairbanks', 'Juneau'],
    Arizona: ['Phoenix', 'Tucson', 'Mesa', 'Chandler'],
    Arkansas: ['Little Rock', 'Fayetteville', 'Fort Smith', 'Springdale'],
    California: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    Colorado: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins'],
    Connecticut: ['Bridgeport', 'New Haven', 'Stamford', 'Hartford'],
    Delaware: ['Wilmington', 'Dover', 'Newark'],
    Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    Georgia: ['Atlanta', 'Savannah', 'Augusta', 'Columbus'],
    Hawaii: ['Honolulu', 'Hilo', 'Kailua'],
    Idaho: ['Boise', 'Nampa', 'Meridian'],
    Illinois: ['Chicago', 'Aurora', 'Naperville', 'Rockford'],
    Indiana: ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend'],
    Iowa: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City'],
    Kansas: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka'],
    Kentucky: ['Louisville', 'Lexington', 'Bowling Green', 'Covington'],
    Louisiana: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette'],
    Maine: ['Portland', 'Lewiston', 'Bangor'],
    Maryland: ['Baltimore', 'Frederick', 'Rockville', 'Gaithersburg'],
    Massachusetts: ['Boston', 'Worcester', 'Springfield', 'Cambridge'],
    Michigan: ['Detroit', 'Grand Rapids', 'Warren', 'Ann Arbor'],
    Minnesota: ['Minneapolis', 'Saint Paul', 'Rochester', 'Duluth'],
    Mississippi: ['Jackson', 'Gulfport', 'Hattiesburg', 'Biloxi'],
    Missouri: ['Kansas City', 'St. Louis', 'Springfield', 'Columbia'],
    Montana: ['Billings', 'Missoula', 'Great Falls'],
    Nebraska: ['Omaha', 'Lincoln', 'Bellevue'],
    Nevada: ['Las Vegas', 'Reno', 'Henderson'],
    'New Hampshire': ['Manchester', 'Nashua', 'Concord'],
    'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth'],
    'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany'],
    'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham'],
    'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks'],
    Ohio: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo'],
    Oklahoma: ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow'],
    Oregon: ['Portland', 'Salem', 'Eugene', 'Gresham'],
    Pennsylvania: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie'],
    'Rhode Island': ['Providence', 'Warwick', 'Cranston'],
    'South Carolina': ['Columbia', 'Charleston', 'North Charleston'],
    'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen'],
    Tennessee: ['Memphis', 'Nashville', 'Knoxville', 'Chattanooga'],
    Texas: ['Houston', 'Dallas', 'San Antonio', 'Austin'],
    Utah: ['Salt Lake City', 'West Valley City', 'Provo'],
    Vermont: ['Burlington', 'South Burlington', 'Rutland'],
    Virginia: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond'],
    Washington: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver'],
    'West Virginia': ['Charleston', 'Huntington', 'Morgantown'],
    Wisconsin: ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha'],
    Wyoming: ['Cheyenne', 'Casper', 'Laramie'],
  },
  UK: {
    England: ['London', 'Manchester', 'Birmingham', 'Liverpool'],
    'Northern Ireland': ['Belfast', 'Derry'],
    Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],
    Wales: ['Cardiff', 'Swansea'],
  },
  AUS: {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong'],
    Victoria: ['Melbourne', 'Geelong', 'Ballarat'],
    Queensland: ['Brisbane', 'Gold Coast', 'Cairns'],
    'South Australia': ['Adelaide', 'Mount Gambier', 'Whyalla'],
    'Western Australia': ['Perth', 'Fremantle', 'Bunbury'],
    Tasmania: ['Hobart', 'Launceston', 'Devonport'],
    'Northern Territory': ['Darwin', 'Alice Springs', 'Palmerston'],
    'Australian Capital Territory': ['Canberra'],
  },
  NZ: {
    Auckland: ['Auckland'],
    'Bay of Plenty': ['Tauranga', 'Rotorua', 'Whakatane'],
    Canterbury: ['Christchurch', 'Timaru', 'Rangiora'],
    Gisborne: ['Gisborne'],
    "Hawke's Bay": ['Napier', 'Hastings'],
    'Manawatu-Whanganui': ['Palmerston North', 'Wanganui', 'Manawatu'],
    Marlborough: ['Blenheim'],
    Nelson: ['Nelson'],
    Otago: ['Dunedin', 'Queenstown', 'Oamaru'],
    Southland: ['Invercargill', 'Gore'],
    Taranaki: ['New Plymouth', 'Taranaki City'],
    Tasman: ['Richmond', 'Motueka'],
    Waikato: ['Hamilton', 'Taupo', 'Cambridge'],
    Wellington: ['Wellington'],
    'West Coast': ['Greymouth', 'Westport'],
  },
};

const countryCodes = Object.keys(countrySubdivisionMapping);
const DEFAULT_SUBDIVISION_LABEL = 'Region/Province';

export function AddressForm({ onSubmit, initialData, companyId, companyName }) {
  // Initialize state with initialData (if provided)
  const [address, setAddress] = useState({
    officeName: '',
    address: '',
    city: '',
    subdivision: '',
    postalCode: '',
    country: '',
    ...initialData,
  });

  // Update state when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setAddress({
        officeName: initialData.officeName || '',
        address: initialData.address || '',
        city: initialData.city || '',
        subdivision: initialData.subdivision || '',
        postalCode: initialData.postalCode || '',
        country: initialData.country || '',
      });
    }
  }, [initialData]);

  // Convert full country name to country code if needed
  useEffect(() => {
    if (initialData && initialData.country) {
      const countryEntry = Object.entries(countrySubdivisionMapping).find(
        ([, data]) => data.name === initialData.country,
      );
      if (countryEntry) {
        setAddress((prev) => ({ ...prev, country: countryEntry[0] }));
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleCountryChange = (value) => {
    // Reset subdivision and city when country changes
    setAddress({ ...address, country: value, subdivision: '', city: '' });
  };

  const handleSubdivisionChange = (value) => {
    // Reset city when subdivision changes
    setAddress({ ...address, subdivision: value, city: '' });
  };

  const handleCityChange = (value) => {
    setAddress({ ...address, city: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert country code to full name before submitting
    const countryName =
      address.country && countrySubdivisionMapping[address.country]
        ? countrySubdivisionMapping[address.country].name
        : address.country;

    // Attach subdivisionType using the mapping label
    onSubmit({
      ...address,
      country: countryName,
      subdivisionType:
        address.country && countrySubdivisionMapping[address.country]
          ? countrySubdivisionMapping[address.country].label
          : DEFAULT_SUBDIVISION_LABEL,
      associatedCompany: companyId,
      companyName,
    });
  };

  // Dynamic label for the subdivision field
  const getSubdivisionLabel = () => {
    return address.country && countrySubdivisionMapping[address.country]
      ? countrySubdivisionMapping[address.country].label
      : DEFAULT_SUBDIVISION_LABEL;
  };

  // Check if the selected country has predefined subdivision options
  const hasSubdivisionOptions = address.country && countrySubdivisionMapping[address.country];

  // Retrieve city options based on selected country and subdivision
  const cityOptions =
    address.country &&
    address.subdivision &&
    cityMapping[address.country] &&
    cityMapping[address.country][address.subdivision]
      ? cityMapping[address.country][address.subdivision]
      : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div className="space-y-2">
        <Label htmlFor="associatedCompany">Organization ID</Label>
        <Input
          id="associatedCompany"
          name="associatedCompany"
          value={companyId || ''}
          disabled
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="officeName">Office Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="officeName"
            name="officeName"
            placeholder="e.g. NetNada HQ"
            className="pl-10"
            value={address.officeName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground z-10" />
          <Select value={address.country} onValueChange={handleCountryChange} required>
            <SelectTrigger id="country" className="pl-10">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countryCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {countrySubdivisionMapping[code].name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subdivision">{getSubdivisionLabel()}</Label>
        {hasSubdivisionOptions ? (
          <Select value={address.subdivision} onValueChange={handleSubdivisionChange} required>
            <SelectTrigger id="subdivision">
              <SelectValue placeholder={`Select ${getSubdivisionLabel()}`} />
            </SelectTrigger>
            <SelectContent className="max-h-56 overflow-y-auto">
              {countrySubdivisionMapping[address.country].options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="subdivision"
            name="subdivision"
            placeholder={`Enter ${getSubdivisionLabel().toLowerCase()}`}
            value={address.subdivision}
            onChange={handleChange}
            required
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        {cityOptions.length > 0 ? (
          <Select value={address.city} onValueChange={handleCityChange} required>
            <SelectTrigger id="city">
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent className="max-h-56 overflow-y-auto">
              {cityOptions.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id="city"
            name="city"
            placeholder="Enter city"
            value={address.city}
            onChange={handleChange}
            required
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          <Input
            id="address"
            name="address"
            placeholder="123 Main Street"
            className="pl-10"
            value={address.address}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="postalCode">Postal Code</Label>
        <Input
          id="postalCode"
          name="postalCode"
          placeholder="10001"
          value={address.postalCode}
          onChange={handleChange}
          required
        />
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full">
          {initialData && initialData._id ? 'Update Address' : 'Add Address'}
        </Button>
      </div>
    </form>
  );
}
