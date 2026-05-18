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
    const imageElement = document.querySelector('.kt-widget__media img');
    if (imageElement) {
      const src = imageElement.getAttribute('src');
      if (src) {
        image = `https://xpat.egov.mv${src}`;
      }
    }

    /* NAME */
    const rawName = document.querySelector('.kt-widget__username')?.textContent || '';
    const name = rawName.replace('✓', '').trim();

    if (!name) {
      return Response.json({
        success: false,
        message: 'Employee not found'
      });
    }

    /* INFO FIELDS — icon-based extraction for reliability */
    const infoLinks = [...document.querySelectorAll('.kt-widget__subhead a')];

    let employer = '';
    let occupation = '';
    let passport = '';
    let wp = '';

    for (const link of infoLinks) {
      const icon = link.querySelector('i');
      const text = link.textContent.trim();
      const title = icon?.getAttribute('title') || '';
      const iconClass = icon?.className || '';

      if (title.includes('employer') || iconClass.includes('businesswoman')) {
        employer = text;
      } else if (title.includes('occupation') || iconClass.includes('suitcase')) {
        occupation = text;
      } else if (title.includes('passport') || iconClass.includes('calendar')) {
        passport = text;
      } else if (title.includes('work permit') || iconClass.includes('website')) {
        wp = text;
      }
    }

    if (!employer && infoLinks[0]) employer = infoLinks[0].textContent.trim();
    if (!occupation && infoLinks[1]) occupation = infoLinks[1].textContent.trim();
    if (!passport && infoLinks[2]) passport = infoLinks[2].textContent.trim();
    if (!wp && infoLinks[3]) wp = infoLinks[3].textContent.trim();

    /* STATUS */
    const status = document.querySelector('.btn-upper')?.textContent?.trim() || 'Unknown';

    /* VALIDITY — check CSS class for green/red indicator */
    const validSpan = document.querySelector('.kt-widget__desc .kt-font-success, .kt-widget__desc .kt-font-danger');
    const isValid = validSpan ? validSpan.classList.contains('kt-font-success') : null;

    /* ISSUED DATE */
    let issuedOn = '';
    const bodyText = document.body.textContent || '';
    const issuedMatch = bodyText.match(/Issued On:\s*([\dA-Za-z-]+)/i);
    if (issuedMatch) {
      issuedOn = issuedMatch[1];
    }

    /* VALID TILL */
    let validTill = '';
    const validMatch = bodyText.match(/Work Permit Valid till:\s*([\dA-Za-z-]+)/i);
    if (validMatch) {
      validTill = validMatch[1];
    }

    /* WORK SITE — extract name and site code separately */
    let workSite = '';
    let workSiteCode = '';
    const workSiteElement = [...document.querySelectorAll('.kt-widget__desc')]
      .find(el => el.textContent.includes('Work Site:'));

    if (workSiteElement) {
      const raw = workSiteElement.textContent.replace('Work Site:', '').trim();
      const codeMatch = raw.match(/\((ST\d+)\)/);
      if (codeMatch) {
        workSiteCode = codeMatch[1];
        workSite = raw.replace(codeMatch[0], '').trim();
      } else {
        workSite = raw;
      }
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
        isValid,
        workSite,
        workSiteCode,
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
