import { AddressLocationInfo as AvataxAddress } from "avatax/lib/models/AddressLocationInfo";
import { AvataxConfig } from "./avatax-connection-schema";
import { AddressFragment } from "../../../generated/graphql";

function mapSaleorAddressToAvataxAddress(address: AddressFragment): AvataxAddress {
  return {
    line1: address.streetAddress1,
    line2: address.streetAddress2,
    city: address.city,
    region: address.countryArea,
    postalCode: address.postalCode,
    country: address.country.code,
  };
}

export const avataxAddressFactory = {
  fromSaleorAddress: mapSaleorAddressToAvataxAddress,
};
