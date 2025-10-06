// @ts-check
/// <reference path="./types.d.ts" />

import { partial, toJson } from './helpers.js';

export function initDispatchEvent() {
  /**
   * 
   * @param {string} eventName 
   * @param {Record<string, any>} [detail] 
   */
  function dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }
  window.dispatch = dispatchEvent;
}

export function on(eventName, callback) {
  document.addEventListener(eventName, (event) => {
    callback(event.detail);
  });
}

export const events = {
  toggleEquipment: "toggle-equipment",
  removeEquipment: "remove-equipment",
  removeGroup: "remove-group",
  removeAllGroups: "remove-all-groups",
  removeAllEquipments: "remove-all-equipments",
  showGetFakeEquipments: "show-get-fake-equipments",
  showEditEquipmentForm: "show-edit-equipment-form",
  showEditGroupForm: "show-edit-group-form",
  groupHasNoEquipments: "group-has-no-equipments",
  filterEquipments: "filter-equipments",
};

/**
 * @param {string} eventName
 * @param {any} details
 */
export function baseDispatch(eventName, details) {
  return `window.dispatch?.call(null, '${eventName}', ${toJson(details)})`
}

/** @type {(details: ToggleEquipmentParams) => void} */
export const dispatchToggleEquipment = partial(baseDispatch, events.toggleEquipment);

/** @type {(details: RemoveEquipmentParams) => void} */
export const dispatchRemoveEquipment = partial(baseDispatch, events.removeEquipment);

/** @type {(details: RemoveGroupParams) => void} */
export const dispatchRemoveGroup = partial(baseDispatch, events.removeGroup);

export const dispatchRemoveAllGroups = partial(baseDispatch, events.removeAllGroups);

/** @type {(details: RemoveAllEquipmentsParams) => void} */
export const dispatchRemoveAllEquipments = partial(baseDispatch, events.removeAllEquipments);

/** @type {(details: ShowGetFakeEquipmentsParams) => void} */
export const dispatchShowGetFakeEquipments = partial(baseDispatch, events.showGetFakeEquipments);

/** @type {(details: ShowEditEquipmentFormParams) => void} */
export const dispatchShowEditEquipmentForm = partial(baseDispatch, events.showEditEquipmentForm);

/** @type {(details: ShowEditGroupFormParams) => void} */
export const dispatchShowEditGroupForm = partial(baseDispatch, events.showEditGroupForm);
