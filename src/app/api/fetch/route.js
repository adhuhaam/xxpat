import { JSDOM } from 'jsdom';

export async function POST(req) {

  try {

    const body = await req.json();

    const formData = new URLSearchParams();

    formData.append('workPermitNumber', body.wp);
    formData.append('firstName', body.search);

    const response = await fetch(
      'https://xpat.egov.mv/EmploymentApproval/EmploymentApproval/WorkPermitVerify',
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const html = await response.text();

    const dom = new JSDOM(html);

    const document = dom.window.document;

    /* IMAGE */

    const imageElement =
      document.querySelector('.kt-widget__media img');

    let image = '';

    if (imageElement) {

      const src = imageElement.getAttribute('src');

      image = `https://xpat.egov.mv${src}`;

    }

    /* NAME */

    const name =
      document.querySelector('.kt-widget__username')
        ?.textContent
        ?.replace('✓', '')
        ?.trim();

    if (!name) {

      return Response.json({
        success: false,
        message: 'Employee not found'
      });

    }

    /* INFO LINKS */

    const infoLinks =
      [...document.querySelectorAll('.kt-widget__subhead a')];

    const employer =
      infoLinks[0]?.textContent?.trim() || '';

    const occupation =
      infoLinks[1]?.textContent?.trim() || '';

    const passport =
      infoLinks[2]?.textContent?.trim() || '';

    const wp =
      infoLinks[3]?.textContent?.trim() || '';

    /* DETAILS */

    const detailText =
      document.querySelector('.kt-widget__info')
        ?.textContent || '';

    /* ISSUED DATE */

    const issuedMatch =
      html.match(/Issued On:\\s*<\\/b>\\s*([^<\\n]+)/i);

    const issuedOn =
      issuedMatch?.[1]?.trim() || '';

    /* VALID TILL */

    const validMatch =
      html.match(/Work Permit Valid till:\\s*<\\/b>[\\s\\S]*?>(.*?)</i);

    const validTill =
      validMatch?.[1]?.trim() || '';

    /* WORK SITE */

    const workSiteMatch =
      html.match(/Work Site:\\s*<\\/b>[\\s\\S]*?<span.*?>(.*?)</i);

    const workSite =
      workSiteMatch?.[1]?.trim() || '';

    /* STATUS */

    const statusElement =
      document.querySelector('.btn-upper');

    const status =
      statusElement?.textContent?.trim() || 'Unknown';

    return Response.json({

      success: true,

      employee: {
        image,
        name,
        employer,
        occupation,
        passport,
        wp,
        issuedOn,
        validTill,
        workSite,
        status
      }

    });

  } catch (err) {

    console.log(err);

    return Response.json({
      success: false,
      message: 'Server error'
    });

  }

}
