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

    let image = '';

    const imageElement =
      document.querySelector('.kt-widget__media img');

    if (imageElement) {

      const src = imageElement.getAttribute('src');

      if (src) {
        image = `https://xpat.egov.mv${src}`;
      }

    }

    /* NAME */

    const rawName =
      document.querySelector('.kt-widget__username')
        ?.textContent || '';

    const name =
      rawName.replace('✓', '').trim();

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

    /* STATUS */

    const status =
      document.querySelector('.btn-upper')
        ?.textContent
        ?.trim() || 'Unknown';

    /* DETAILS TEXT */

    const bodyText =
      document.body.textContent || '';

    /* ISSUED DATE */

    let issuedOn = '';

    const issuedMatch =
      bodyText.match(/Issued On:\s*([A-Za-z0-9-]+)/i);

    if (issuedMatch) {
      issuedOn = issuedMatch[1];
    }

    /* VALID TILL */

    let validTill = '';

    const validMatch =
      bodyText.match(/Work Permit Valid till:\s*([A-Za-z0-9-]+)/i);

    if (validMatch) {
      validTill = validMatch[1];
    }

    /* WORK SITE */

    let workSite = '';

    const workSiteElement =
      [...document.querySelectorAll('.kt-widget__desc')]
        .find(el =>
          el.textContent.includes('Work Site:')
        );

    if (workSiteElement) {

      workSite =
        workSiteElement.textContent
          .replace('Work Site:', '')
          .trim();

    }

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
