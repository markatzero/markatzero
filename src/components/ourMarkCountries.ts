const codes = `
AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN
BG BF BI CV KH CM CA CF TD CL CN CO KM CR HR CU CY CZ CD DK DJ DM DO EC EG
SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HU IS IN
ID IR IQ IE IL IT CI JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MG
MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG
KP MK NO OM PK PW PA PG PY PE PH PL PT QA CG RO RU RW KN LC VC WS SM ST SA
SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG
TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW
`
  .trim()
  .split(/\s+/);

export type OurMarkCountry = {
  code: string;
  name: string;
};

export function getOurMarkCountries(): OurMarkCountry[] {
  const names = new Intl.DisplayNames(["en"], {
    type: "region",
  });

  return codes
    .map((code) => ({
      code,
      name: names.of(code) || code,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}