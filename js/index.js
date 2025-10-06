// @ts-check
/// <reference path="./types.d.ts" />

import { getGroup, getEquipment, getEquipmentGroupById } from './data.js';
import { handleClick, initCustomEvents } from './event-handlers.js';
import { Maybe, fixHeightForm } from './helpers.js';
import { renderGroups, renderEquipments, renderNotFound, renderEditEquipmentForm, renderEditGroupForm } from './renders.js';
import {initTheme} from "./theme.js";

const stylesLink = document.createElement("link");
stylesLink.rel = "stylesheet";
stylesLink.href = "css/index.css";
document.head.append(stylesLink);

document.addEventListener("DOMContentLoaded", start);

function start() {
  const root = document.getElementById("root");
  if (!root) return;
  root.innerHTML = /*html*/`
    <div class="container">
      <div class="content"></div>
    </div>` 
  const container = document.querySelector(".content");
  if (!container) return;
  container.replaceChildren(router());
  root.addEventListener("click", handleClick);
  initTheme()
  initCustomEvents()
  fixHeightForm()
}

window.addEventListener("hashchange", () => {
  const container = document.querySelector(".content");
  if (!container) return;
  container.replaceChildren(router());
  fixHeightForm()
});

function router() {
  const hash = window.location.hash;
  switch (true) {
    case hash === "":
      return renderGroups();
    case /^#\/equipments\/\d+\/edit/.test(hash):
      return Maybe.of(hash.match(/^#\/equipments\/(\d+)\/edit/))
        .bind(([, groupId]) => getGroup({
          id: Number(groupId)
        }))
        .bind(group => renderEditGroupForm(group))
        .catch(() => renderNotFound())
        .get();
    case /^#\/equipments\/\d+\/\d+\/edit/.test(hash):
      return Maybe.of(hash.match(/^#\/equipments\/(\d+)\/(\d+)\/edit/))
        .bind(([, groupId, equipmentId]) => getEquipment({
          groupId: Number(groupId),
          equipmentId: Number(equipmentId),
        }))
        .bind(equipment => renderEditEquipmentForm(equipment))
        .catch(() => renderNotFound())
        .get();
    case hash.startsWith("#/equipments/"):
      const id = hash.split("/")[2];
      const group = getEquipmentGroupById(id);
      if (group) return renderEquipments(group);
      return renderNotFound();
    default:
      return renderNotFound();
  }
}