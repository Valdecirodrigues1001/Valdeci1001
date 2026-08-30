import Script from "next/script";

export type TrackingConfig = {
  metaPixelId: string | null;
  ga4MeasurementId: string | null;
  googleAdsTagId: string | null;
  /*
   * Label da ação de conversão do Google Ads. Combinado
   * com googleAdsTagId vira o "send_to" do evento. Não é
   * usado por este componente — só pelo formulário.
   */
  googleAdsConversionLabel: string | null;
};

type TrackingScriptsProps = {
  config: TrackingConfig;
};

/*
 * Carrega os pixels de conversão da campanha.
 *
 * Só injeta o que estiver configurado. Os eventos de
 * conversão são disparados no envio do formulário
 * (ver components/support-form.tsx).
 */
export function TrackingScripts({
  config,
}: TrackingScriptsProps) {
  const {
    metaPixelId,
    ga4MeasurementId,
    googleAdsTagId,
  } = config;

  const gtagId = ga4MeasurementId || googleAdsTagId;

  if (!metaPixelId && !gtagId) {
    return null;
  }

  return (
    <>
      {metaPixelId ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window,document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId}');
              fbq('track', 'PageView');
            `}
          </Script>

          <noscript>
            {/* Snippet oficial da Meta — precisa ser <img> puro. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}

      {gtagId ? (
        <>
          <Script
            id="gtag-src"
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
          />

          <Script id="gtag-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              ${
                ga4MeasurementId
                  ? `gtag('config', '${ga4MeasurementId}');`
                  : ""
              }
              ${
                googleAdsTagId
                  ? `gtag('config', '${googleAdsTagId}');`
                  : ""
              }
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}
