import { useState, useEffect, useCallback } from 'react';
import {
  BannerAd,
  BannerAdSize,
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';

const IS_TEST = __DEV__;

export const BANNER_AD_ID = IS_TEST
  ? TestIds.ADAPTIVE_BANNER
  : 'ca-app-pub-9339911776645987/7380260823';

export const INTERSTITIAL_AD_ID = IS_TEST
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-9339911776645987/4426794424';

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);
  const [ad] = useState(() => InterstitialAd.createForAdRequest(INTERSTITIAL_AD_ID, {
    requestNonPersonalizedAdsOnly: false,
  }));

  useEffect(() => {
    const unsubLoad = ad.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const unsubClose = ad.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      ad.load();
    });
    const unsubError = ad.addAdEventListener(AdEventType.ERROR, () => {
      setLoaded(false);
    });
    ad.load();
    return () => {
      unsubLoad();
      unsubClose();
      unsubError();
    };
  }, [ad]);

  const showAd = useCallback(() => {
    if (loaded) {
      ad.show();
      return true;
    }
    return false;
  }, [ad, loaded]);

  return { showAd, loaded };
}

export { BannerAd, BannerAdSize };
