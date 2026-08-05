import { readFile } from "node:fs/promises";

import { createServer } from "vite";

const MIN_VISIBLE_TARGET_DISTANCE = 63.5;

const issues = [];
const assert = (condition, message) => {
  if (!condition) issues.push(message);
};

const duplicateValues = (values) => {
  const seen = new Set();
  const duplicates = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates];
};

const vite = await createServer({
  appType: "custom",
  logLevel: "silent",
  server: { middlewareMode: true },
});

try {
  const game = await vite.ssrLoadModule("/src/lib/game-data.ts");
  const geo = await vite.ssrLoadModule("/src/lib/geo.ts");
  const labels = await vite.ssrLoadModule("/src/data/province-labels.ts");
  const names = await vite.ssrLoadModule("/src/lib/place-name.ts");
  const regions = await vite.ssrLoadModule("/src/lib/province-regions.ts");
  const questions = await vite.ssrLoadModule("/src/data/study/questions.ts");
  const facts = await vite.ssrLoadModule("/src/data/study/facts.ts");
  const studySources = await vite.ssrLoadModule("/src/data/study/sources.ts");
  const topicEssentials = await vite.ssrLoadModule("/src/data/topic-essentials.ts");
  const schemas = await vite.ssrLoadModule("/src/lib/study/schemas.ts");
  const studyPrompt = await vite.ssrLoadModule("/src/server/study-prompt.server.ts");
  const studyReview = await vite.ssrLoadModule("/src/lib/study/build-static-review.ts");
  const studyReviewServer = await vite.ssrLoadModule("/src/server/study-review.server.ts");
  const provinceData = JSON.parse(await readFile("src/data/turkey-provinces.json", "utf8"));

  assert(
    duplicateValues(game.CATEGORIES.map((category) => category.slug)).length === 0,
    "Kategori slug değerleri benzersiz olmalı.",
  );

  const categorySlugs = new Set(game.CATEGORIES.map((category) => category.slug));
  const topicEssentialSlugs = Object.keys(topicEssentials.TOPIC_ESSENTIALS);
  const missingTopicEssentials = [...categorySlugs].filter(
    (categorySlug) => !topicEssentials.TOPIC_ESSENTIALS[categorySlug],
  );
  const orphanTopicEssentials = topicEssentialSlugs.filter(
    (categorySlug) => !categorySlugs.has(categorySlug),
  );
  assert(
    missingTopicEssentials.length === 0,
    `Harita altı konu özeti eksik: ${missingTopicEssentials.join(", ")}.`,
  );
  assert(
    orphanTopicEssentials.length === 0,
    `Artık kullanılmayan konu özeti kaydı var: ${orphanTopicEssentials.join(", ")}.`,
  );
  for (const [categorySlug, topic] of Object.entries(topicEssentials.TOPIC_ESSENTIALS)) {
    assert(
      typeof topic.definition === "string" && topic.definition.trim().length >= 40,
      `${categorySlug}: konu tanımı kısa veya eksik.`,
    );
    assert(
      Array.isArray(topic.keyPoints) && topic.keyPoints.length >= 3,
      `${categorySlug}: en az üç sınavlık çekirdek bilgi bulunmalı.`,
    );
    assert(
      typeof topic.examTip === "string" && topic.examTip.trim().length >= 30,
      `${categorySlug}: ÖSYM ipucu kısa veya eksik.`,
    );
  }

  let itemCount = 0;
  let minimumDistance = Number.POSITIVE_INFINITY;
  for (const category of game.CATEGORIES) {
    itemCount += category.items.length;
    const duplicateIds = duplicateValues(category.items.map((item) => item.id));
    const duplicateNames = duplicateValues(
      category.items.map((item) => names.normalizePlaceName(item.name)),
    );
    assert(
      duplicateIds.length === 0,
      `${category.slug}: yinelenen hedef kimliği (${duplicateIds.join(", ")}).`,
    );
    assert(
      duplicateNames.length === 0,
      `${category.slug}: yinelenen hedef adı (${duplicateNames.join(", ")}).`,
    );

    for (const item of category.items) {
      assert(
        Number.isFinite(item.lat) && Number.isFinite(item.lon),
        `${category.slug}/${item.name}: koordinat sonlu bir sayı olmalı.`,
      );
      const point = geo.project(item.lat, item.lon);
      assert(
        point.x >= 0 && point.x <= geo.MAP_W && point.y >= 0 && point.y <= geo.MAP_H,
        `${category.slug}/${item.name}: işaret noktası haritanın dışında.`,
      );
    }

    const targets = game.targetsFor(category);
    const focus = geo.focusBoundsForSlug(category.slug, category.items);
    if (focus) {
      for (const item of category.items) {
        const point = geo.project(item.lat, item.lon);
        assert(
          point.x >= focus.x &&
            point.x <= focus.x + focus.w &&
            point.y >= focus.y &&
            point.y <= focus.y + focus.h,
          `${category.slug}/${item.name}: otomatik kamera hedefi kesiyor.`,
        );
      }
    }
    if (category.slug !== "iller-81") {
      for (let first = 0; first < targets.length; first += 1) {
        for (let second = first + 1; second < targets.length; second += 1) {
          minimumDistance = Math.min(
            minimumDistance,
            Math.hypot(targets[first].x - targets[second].x, targets[first].y - targets[second].y),
          );
        }
      }
    }

    const bank = questions.getWarmupQuestionBank(category.slug).slice(0, 3);
    assert(bank.length === 3, `${category.slug}: oyun öncesinde tam 3 soru bulunmalı.`);
    assert(
      duplicateValues(bank.map((question) => `${question.prompt}|${question.choices.join("|")}`))
        .length === 0,
      `${category.slug}: ilk 3 soruda içerik tekrarı var.`,
    );
    if (category.slug !== "ruzgarlar") {
      assert(
        bank.some((question) => question.statements?.length === 3),
        `${category.slug}: birden fazla bilgiyi birlikte ölçen soru eksik.`,
      );
    }

    const factMap = facts.getStudyFactMap(category.slug);
    for (const question of bank) {
      const parsed = schemas.WarmupQuestionSchema.safeParse(question);
      assert(parsed.success, `${category.slug}/${question.id}: soru şemaya uymuyor.`);
      assert(
        question.relatedFactIds.every((factId) => factMap.has(factId)),
        `${category.slug}/${question.id}: doğrulanmış bilgi bağı eksik.`,
      );
      assert(
        question.sourceRefs.every((sourceId) => Boolean(studySources.getStudySource(sourceId))),
        `${category.slug}/${question.id}: kaynak meta verisi eksik.`,
      );
    }
    for (const fact of factMap.values()) {
      assert(
        fact.sourceRefs.every((sourceId) => Boolean(studySources.getStudySource(sourceId))),
        `${category.slug}/${fact.id}: bilgi kaynağı meta verisi eksik.`,
      );
    }

    const syntheticMistakes = category.items.slice(0, 8).map((item) => ({
      kind: "target",
      id: item.id,
      count: 1,
    }));
    const trustedPayload = studyPrompt.buildTrustedStudyPayload({
      categorySlug: category.slug,
      correctCount: 0,
      wrongCount: syntheticMistakes.length,
      totalMs: 1_000,
      wrongAttempts: syntheticMistakes,
      wrongWarmupQuestionIds: bank.slice(0, 3).map((question) => question.id),
    });
    const sentFactIds = new Set(trustedPayload.facts.map((fact) => fact.id));
    assert(
      trustedPayload.facts.length <= 20,
      `${category.slug}: AI bilgi paketi 20 sınırını aşıyor.`,
    );
    assert(
      trustedPayload.mistakes.length <= 4,
      `${category.slug}: AI yanlış bağlamı 4 sınırını aşıyor.`,
    );
    for (const mistake of trustedPayload.mistakes) {
      assert(
        mistake.allowedFactIds.length > 0 &&
          mistake.allowedFactIds.every((factId) => sentFactIds.has(factId)),
        `${category.slug}/${mistake.id}: AI izinli bilgi kümesi kapanmıyor.`,
      );
    }
  }

  assert(
    minimumDistance >= MIN_VISIBLE_TARGET_DISTANCE,
    `Görünen hedefler arası en düşük mesafe ${minimumDistance.toFixed(2)}.`,
  );

  const allMountains = game.CATEGORY_MAP["tum-daglar"].items.map((item) => item.name).sort();
  const mountainUnion = ["kivrim-daglari", "kirik-daglari", "volkanik-daglar"]
    .flatMap((slug) => game.CATEGORY_MAP[slug].items.map((item) => item.name))
    .sort();
  assert(
    JSON.stringify(allMountains) === JSON.stringify(mountainUnion),
    "Tüm Dağlar, üç dağ kategorisinin eksiksiz birleşimi olmalı.",
  );
  for (const slug of ["kivrim-daglari", "kirik-daglari"]) {
    for (const target of game.targetsFor(game.CATEGORY_MAP[slug])) {
      assert(Boolean(target.shape), `${slug}/${target.name}: doğrulanacak dağ çizgisi eksik.`);
    }
  }
  for (const slug of ["akarsular", "delta-ovalari", "otoyollar", "dogalgaz-boru-hatlari"]) {
    for (const target of game.targetsFor(game.CATEGORY_MAP[slug])) {
      assert(Boolean(target.shape), `${slug}/${target.name}: çizgi veya alan şekli eksik.`);
    }
  }

  const windDirections = game.CATEGORY_MAP.ruzgarlar.items
    .map((item) => item.compassDirection)
    .sort();
  assert(
    JSON.stringify(windDirections) === JSON.stringify(["E", "N", "NE", "NW", "S", "SE", "SW", "W"]),
    "Rüzgâr oyununda sekiz pusula yönü eksiksiz ve benzersiz olmalı.",
  );
  assert(game.COMPASS_LAYOUT.length === 8, "Rüzgâr pusulasında sekiz yerleşim olmalı.");

  const requiredCategorySources = {
    findik: "tuik-bitkisel",
    sigir: "tarim-hayvancilik",
    akarsular: "dsi-sular",
    "milli-parklar": "dkmp-korunan-alanlar",
    ramsar: "ramsar-turkiye",
    "serbest-bolgeler": "ticaret-serbest-bolgeler",
    demir: "etkb-madenler",
    ruzgar: "repa-ruzgar",
    otoyollar: "kgm-yol-agi",
    yht: "uab-yht",
    havalimanlari: "dhmi-havalimanlari",
    kruvaziyer: "uab-denizcilik",
    unesco: "unesco-turkiye",
  };
  for (const [categorySlug, sourceId] of Object.entries(requiredCategorySources)) {
    const sourceRefs = studySources.sourceRefsForCategory(game.CATEGORY_MAP[categorySlug]);
    assert(sourceRefs.includes(sourceId), `${categorySlug}: kategoriye özel resmî kaynak eksik.`);
  }

  const mapProvinceNames = new Set(
    provinceData.provinces.map((province) => names.normalizePlaceName(province.name)),
  );
  const cardProvinceNames = new Set(
    game.CATEGORY_MAP["iller-81"].items.map((item) => names.normalizePlaceName(item.name)),
  );
  const labelProvinceNames = new Set(
    Object.keys(labels.PROVINCE_LABEL_LAYOUT).map(names.normalizePlaceName),
  );
  assert(mapProvinceNames.size === 81, "SVG haritada 81 il bulunmalı.");
  assert(cardProvinceNames.size === 81, "81 İl oyununda 81 kart bulunmalı.");
  assert(labelProvinceNames.size === 81, "81 il için iç etiket konumu bulunmalı.");
  for (const provinceName of mapProvinceNames) {
    assert(cardProvinceNames.has(provinceName), `81 İl kartı eksik: ${provinceName}.`);
    assert(labelProvinceNames.has(provinceName), `İl içi etiket konumu eksik: ${provinceName}.`);
  }

  const regionCategories = {
    "marmara-illeri": "Marmara",
    "ege-illeri": "Ege",
    "akdeniz-illeri": "Akdeniz",
    "ic-anadolu-illeri": "İç Anadolu",
    "karadeniz-illeri": "Karadeniz",
    "dogu-anadolu-illeri": "Doğu Anadolu",
    "guneydogu-anadolu-illeri": "Güneydoğu Anadolu",
  };
  for (const [categorySlug, regionName] of Object.entries(regionCategories)) {
    const expected = provinceData.provinces
      .filter((province) => regions.REGION_OF[province.name] === regionName)
      .map((province) => names.normalizePlaceName(province.name))
      .sort();
    const actual = game.CATEGORY_MAP[categorySlug].items
      .map((item) => names.normalizePlaceName(item.name))
      .sort();
    assert(
      JSON.stringify(actual) === JSON.stringify(expected),
      `${categorySlug}: bölge-il listesi REGION_OF ile uyuşmuyor.`,
    );
  }

  const constraintCategory = game.CATEGORY_MAP["marmara-illeri"];
  const constraintRequest = {
    categorySlug: constraintCategory.slug,
    correctCount: 0,
    wrongCount: 2,
    totalMs: 2_000,
    wrongAttempts: constraintCategory.items.slice(0, 2).map((item) => ({
      kind: "target",
      id: item.id,
      count: 1,
    })),
    wrongWarmupQuestionIds: [],
  };
  const constraintPayload = studyPrompt.buildTrustedStudyPayload(constraintRequest);
  const firstMistake = constraintPayload.mistakes[0];
  const allowedFact = firstMistake?.allowedFactIds[0];
  const constraints = {
    sentFactIds: constraintPayload.facts.map((fact) => fact.id),
    allowedFactIdsByMistake: Object.fromEntries(
      constraintPayload.mistakes.map((mistake) => [mistake.id, mistake.allowedFactIds]),
    ),
  };
  const validPlan = {
    essentialFactIds: [constraintPayload.facts[0].id],
    focus: [
      {
        mistakeId: firstMistake.id,
        factIds: [allowedFact],
        reason: "exam_high_yield",
      },
    ],
    studyOrder: [firstMistake.id],
    closingTone: "encouraging",
  };
  assert(
    Boolean(studyReview.buildReviewFromAiPlan(constraintRequest, validPlan, constraints)),
    "Kapalı AI planının geçerli örneği kabul edilmeli.",
  );
  const forbiddenFact = constraintPayload.facts.find(
    (fact) => !firstMistake.allowedFactIds.includes(fact.id),
  );
  if (forbiddenFact) {
    assert(
      studyReview.buildReviewFromAiPlan(
        constraintRequest,
        {
          ...validPlan,
          focus: [
            {
              ...validPlan.focus[0],
              factIds: [forbiddenFact.id],
            },
          ],
        },
        constraints,
      ) === null,
      "AI planı yanlışla ilişkisiz bir bilgiyi seçememeli.",
    );
  }

  const originalFetch = globalThis.fetch;
  const originalAiEnabled = process.env.AI_STUDY_ENABLED;
  const originalApiKey = process.env.OPENAI_API_KEY;
  let capturedOpenAiBody;
  try {
    process.env.AI_STUDY_ENABLED = "true";
    process.env.OPENAI_API_KEY = "test-only";
    globalThis.fetch = async (_url, init) => {
      capturedOpenAiBody = JSON.parse(String(init?.body ?? "{}"));
      return new Response(JSON.stringify({ output_text: JSON.stringify(validPlan) }), {
        status: 200,
      });
    };
    const aiResponse = await studyReviewServer.getStudyReviewOnServer(constraintRequest);
    assert(aiResponse.source === "ai", "Geçerli kapalı model planı AI yanıtına dönüşmeli.");
    assert(
      capturedOpenAiBody?.model === "gpt-5-nano-2025-08-07" &&
        capturedOpenAiBody?.store === false &&
        capturedOpenAiBody?.reasoning?.effort === "minimal" &&
        capturedOpenAiBody?.text?.verbosity === "low" &&
        capturedOpenAiBody?.text?.format?.type === "json_schema" &&
        capturedOpenAiBody?.max_output_tokens === 480,
      "OpenAI isteği düşük maliyetli ve katı yapılandırmayı korumalı.",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (originalAiEnabled === undefined) {
      delete process.env.AI_STUDY_ENABLED;
    } else {
      process.env.AI_STUDY_ENABLED = originalAiEnabled;
    }
    if (originalApiKey === undefined) {
      delete process.env.OPENAI_API_KEY;
    } else {
      process.env.OPENAI_API_KEY = originalApiKey;
    }
  }

  const result = {
    categories: game.CATEGORIES.length,
    items: itemCount,
    minimumVisibleTargetDistance: Number(minimumDistance.toFixed(3)),
    provinces: mapProvinceNames.size,
    issues,
  };
  console.log(JSON.stringify(result, null, 2));
  if (issues.length > 0) process.exitCode = 1;
} finally {
  await vite.close();
}
