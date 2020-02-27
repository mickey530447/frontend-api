/* eslint-disable func-names */
/* eslint-disable no-restricted-syntax */
/* ------------------------------------------------------------------------------------------------
 * Copyright (c) mgm security partners GmbH. All rights reserved.
 * Licensed under the AGPLv3 License. See LICENSE.md in the project root for license information.
 * ------------------------------------------------------------------------------------------------*/

const xmlbuilder = require('xmlbuilder');
const TagService = require('../service/TagService');
const TestcaseService = require('../service/TestcaseService');

module.exports.sitemapIndex = async (req, res) => {
  try {
    const PathDefault = 'https://www.canitrust.in/';
    const TagDefault = 'https://www.canitrust.in/tag/';
    const obj = {
      urlset: {
        '@xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        url: [],
      },
    };
    const tagModified = [];
    const PathData = await TestcaseService.getAllPageTestcase();
    let date = new Date('January 1, 2018');
    // Add testcase path in sitemap
    for (const item of PathData) {
      const elementPath = {
        loc: PathDefault.concat(item.path),
        lastmod: item.date_created.toISOString().substring(0, 10),
        changefreq: 'Monthly',
      };
      for (let i = 0; i < item.tagNums.length; i++) {
        // Check element if null then initialize
        if (!tagModified[item.tagNums[i]])
          tagModified[item.tagNums[i]] = new Date('January 1, 2018');
        if (tagModified[item.tagNums[i]] < item.date_created)
          tagModified[item.tagNums[i]] = item.date_created;
      }
      if (date <= item.date_created) date = item.date_created;
      obj.urlset.url.push(elementPath);
    }
    // Add hompage path in sitemap
    const homepageElement = {
      loc: PathDefault,
      lastmod: date.toISOString().substring(0, 10),
      changefreq: 'Weekly',
    };
    obj.urlset.url.unshift(homepageElement);
    // Add Tag path in sitemap
    const TagData = await TagService.getAllTag();
    for (const item of TagData) {
      // Check this tag has any testcase yet in case some tag don't have any testcase
      if (!tagModified[item.tagNumber])
        tagModified[item.tagNumber] = new Date('January 1, 2018');
      const elementTag = {
        loc: TagDefault.concat(item.tagText),
        lastmod: tagModified[item.tagNumber].toISOString().substring(0, 10),
        changefreq: 'Monthly',
      };
      console.log(tagModified[item.tagNumber]);
      obj.urlset.url.push(elementTag);
    }
    const feed = xmlbuilder.create(obj, { encoding: 'UTF-8' });
    const tmp = feed.end({ pretty: true });
    res.setHeader('Content-Type', 'application/xml');
    res.removeHeader('Content-Security-Policy');
    return res.status(200).send(tmp);
  } catch (error) {
    console.log(error);
    return res.status(400).json(null);
  }
};
