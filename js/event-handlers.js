// @ts-check
/// <reference path="./types.d.ts" />

import { getFakeUsers, getGroup, getEquipment, getEquipmentGroups, saveEquipments } from './data.js';
import { events, initDispatchEvent, on } from './events.js';
import { handleGetFakeEquipments } from './form-handlers.js';
import { Maybe, compose, getFullHeightOfChildren, initModalCloseHandler, removeAnimatedModal } from './helpers.js';
import { doneIcon, hideIcon, progressIcon, showIcon } from './icons.js';
import { getEquipmentsTemplate, renderGetEquipmentsForm, renderModal } from './renders.js';

export function handleDropdown(event) {
  const dropdown = event.target.closest(".dropdown");
  if (dropdown && event.target.closest("#dropdown__action-button")) {
    dropdown.classList.toggle("dropdown_open");
  } else {
    document.querySelectorAll(".dropdown").forEach(dropdown => {
      dropdown.classList.remove("dropdown_open");
    });
  }
}

export function handleToggleFormVisible(event) {
  /** @type {HTMLFormElement | null} */
  const form = document.querySelector(".create-form");
  const minimizeButton = event.target.closest("#minimize-button");
  if (form && minimizeButton) {
    const formHeight = form.offsetHeight;
    form.style.height = formHeight > 0 ? '0' : getFullHeightOfChildren(form) + "px";
    minimizeButton.innerHTML = parseInt(form.style.height) > 0
      ? 'Hide ' + hideIcon() : 'Show ' + showIcon();
  }
}

export const handleClick = compose(
  handleDropdown,
  handleToggleFormVisible,
)

// These handler functions below run by custom events

/**
 * 
 * @param {ShowEditGroupFormParams} params
 */
function handleShowEditGroupForm({ groupId }) {
  // history.pushState(null, '', `#/equipments/edit?groupId=${groupId}&equipmentId=${equipmentId}`);
  window.location.hash = `#/equipments/${groupId}/edit`;
}

/**
 * 
 * @param {ShowEditEquipmentFormParams} params
 */
function handleShowEditEquipmentForm({ groupId, equipmentId }) {
  // history.pushState(null, '', `#/equipments/edit?groupId=${groupId}&equipmentId=${equipmentId}`);
  window.location.hash = `#/equipments/${groupId}/${equipmentId}/edit`;
}

/**
 * 
 * @param {ToggleEquipmentParams} details 
 * @returns 
 */
function handleToggleEquipment({ groupId, equipmentId }) {
  const equipment = getEquipment({ groupId, equipmentId });
  if (!equipment) return;
  equipment.done = !equipment.done;
  saveEquipments();
  Maybe.of(document.querySelector(`.equipment[data-id="${equipmentId}"]`))
    .bind(equipmentElement => equipmentElement.querySelector(".equipment__title"))
    .do(subtitle => subtitle.classList.toggle("equipment-title_done"))
    .bind(() => document.querySelector(`.equipment[data-id="${equipmentId}"] .status__text`))
    .do(status => status.innerHTML = equipment.done ? `${doneIcon()} Done` : `${progressIcon()} In progress`)
    .bind(() => document.querySelector(`#equipment-filter`))
    .bind(filter => filter instanceof HTMLSelectElement ? filter.value : null)
    .do(filter => {
      if (filter === 'all') return;
      const equipmentElement = document.querySelector(`.equipment[data-id="${equipmentId}"]`);
      if (!equipmentElement) return;
      if (filter === 'true' && !equipment.done) equipmentElement.remove();
      else if (filter === 'false' && equipment.done) equipmentElement.remove();
    })
}

/**
 * 
 * @param {RemoveEquipmentParams} details 
 */
function handleRemoveEquipment({ groupId, equipmentId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getGroup({ id: groupId }))
    .do(group => group.equipments = group.equipments.filter(equipment => equipment.id !== Number(equipmentId)))
    .do(() => saveEquipments())
    .bind(() => document.querySelector(`.equipment[data-id="${equipmentId}"]`))
    .do(equipmentElement => equipmentElement.remove());
}

/**
 * 
 * @param {RemoveGroupParams} details 
 */
function handleRemoveGroup({ groupId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getEquipmentGroups())
    .bind(groups => groups.filter(group => group.id !== Number(groupId)))
    .do(groups => saveEquipments(groups))
    .bind(() => document.querySelector(`.group[data-id="${groupId}"]`))
    .do(groupElement => groupElement.remove())
    .catch(() => window.location.hash = "");
}

function handleRemoveAllGroups() {
  if (!confirm("Are you sure?")) return;
  saveEquipments([]);
  Maybe.of(document.querySelector(".groups__list"))
    .do(groupList => groupList.innerHTML = "");
}

/**
 * 
 * @param {RemoveAllEquipmentsParams} details 
 */
function handleRemoveAllEquipments({ groupId }) {
  if (!confirm("Are you sure?")) return;
  Maybe.of(getGroup({ id: groupId }))
    .do(group => group.equipments = [])
    .do(() => saveEquipments())
    .bind(() => document.querySelector(".equipments__list"))
    .do(equipmentList => equipmentList.innerHTML = "");
}

/**
 * 
 * @param {ShowGetFakeEquipmentsParams} details 
 */
async function handleShowGetFakeEquipments({ groupId }) {
  Maybe.of(await getFakeUsers())
    .bind(users => renderModal(renderGetEquipmentsForm(users, groupId)))
    .bind(modal => modal.querySelector(".modal"))
    .do(modal => {
      modal.classList.add("modal_enter");
      document.body.append(modal);
      initModalCloseHandler(modal);
      const form = modal.querySelector("form");
      if (!form) return null;
      form.addEventListener("submit", (e) =>
        handleGetFakeEquipments(e, () => removeAnimatedModal(modal)))
    })
    .catch(() => alert("Something went wrong. Try again later."))
}

function handleNoItems() {
  Maybe.of(document.querySelector(".create-form"))
    .bind(form => form instanceof HTMLFormElement ? form : null)
    .bind(form => form.style.height = getFullHeightOfChildren(form) + "px")
    .bind(() => document.querySelector("#minimize-button"))
    .do(minimizeButton => minimizeButton.innerHTML = 'Hide ' + hideIcon())
    .catch(() => console.log("Something went wrong. Try again later."))
}

/**
 * @param {FilterEquipmentsParams} details
 */
function handleFilterEquipments({ groupId, done }) {
  const group = getGroup({ id: groupId });
  if (!group) return;
  const equipmentList = document.querySelector(".equipments__list");
  if (!equipmentList) return;
  equipmentList.innerHTML = getEquipmentsTemplate({
    ...group,
    equipments: group.equipments.filter(equipment => done === 'all' || String(equipment.done) === done),
  });
}


export function initCustomEvents() {
  initDispatchEvent();
  on(events.toggleEquipment, handleToggleEquipment);
  on(events.removeEquipment, handleRemoveEquipment);
  on(events.removeGroup, handleRemoveGroup);
  on(events.removeAllGroups, handleRemoveAllGroups);
  on(events.removeAllEquipments, handleRemoveAllEquipments);
  on(events.showGetFakeEquipments, handleShowGetFakeEquipments);
  on(events.showEditGroupForm, handleShowEditGroupForm);
  on(events.showEditEquipmentForm, handleShowEditEquipmentForm);
  on(events.filterEquipments, handleFilterEquipments);
}

/**
 * 
 * @param {Element} list 
 */
export function observeList(list) {
  if (!(list instanceof HTMLElement)) throw new Error("list is not an instance of HTMLElement");
  const observer = new MutationObserver((mutations) => {
    if (mutations.length === 0) return;
    if (mutations.some(mutation => mutation.type === "childList")) {
      if (list.children.length === 0) {
        list.innerHTML = `<h5 class="no-entries">No entries yet. Add new one using the form above.</h5>`;
        handleNoItems();
      }
      else Maybe.of(list.querySelector(".no-entries"))
        .do(noEntries => {
          if (mutations.filter(mutation => mutation.type === "childList").some(mutation => {
            return [...mutation.addedNodes]
              .filter(node => node instanceof HTMLElement)
              .some(node => node.classList.contains("list__item"))
          })) noEntries.remove()
        })
    }
  });
  observer.observe(list, {
    childList: true,
  });
}