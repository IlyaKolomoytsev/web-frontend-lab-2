// @ts-check
/// <reference path="./types.d.ts" />

import { getData, getFakeEquipmentsForUser, getGroup, getEquipment, getEquipmentGroups, saveEquipments } from './data.js';
import { Maybe, sanitize } from './helpers.js';
import { getEquipmentGroupsTemplate, getEquipmentsTemplate } from './renders.js';

/**
 * @param {Event} event 
 */
export function handleAddEquipmentGroup(event) {
  const { values: { title, description } } = handleForm(event)
  if (title && description) {
    const equipments = getEquipmentGroups();
    const newGroup = {
      id: equipments.length + 1,
      title,
      description,
      equipments: [],
    };
    equipments.push(newGroup);
    saveEquipments(equipments);
    const groupsList = document.querySelector(".groups__list");
    if (!groupsList) return;
    groupsList.insertAdjacentHTML("beforeend", getEquipmentGroupsTemplate([newGroup]));
  }
}

/**
 * @param {Event} event 
 */
export function handleAddEquipment(event) {
  const { values: { title, description }, form } = handleForm(event)
  if (title && description) {
    const groupId = form.closest(".equipments")?.dataset?.groupId;
    const { equipments, group } = getData({ groupId });
    if (!group) return;
    const newEquipment = {
      id: group.equipments.length + 1,
      title,
      description,
      done: false,
      groupId
    };
    group.equipments.push(newEquipment);
    saveEquipments(equipments);
    // check equipment-filter
    const equipmentFilter = document.querySelector("#equipment-filter");
    if (equipmentFilter instanceof HTMLSelectElement && equipmentFilter.value === "true") return;
    const equipmentList = document.querySelector(".equipments__list");
    if (!equipmentList) return;
    equipmentList.insertAdjacentHTML("beforeend", getEquipmentsTemplate({ ...group, equipments: [newEquipment] }));
  }
}

/**
 * @param {Event} event 
 */
export function handleEditEquipment(event) {
  const { values: { title, description, done }, form } = handleForm(event)
  const groupId = Number(form.dataset.groupId)
  const equipmentId = Number(form.dataset.equipmentId)
  const equipment = getEquipment({ groupId, equipmentId });
  if (!equipment) return;
  equipment.title = title;
  equipment.description = description;
  equipment.done = done === 'true'
  saveEquipments();
  window.location.hash = `#/equipments/${groupId}`
}

/**
 * @param {Event} event 
 */
export function handleEditGroup(event) {
  const { values: { title, description }, form } = handleForm(event)
  const groupId = Number(form.dataset.groupId)
  const group = getEquipmentGroups().find(group => group.id === groupId);
  if (!group) return;
  group.title = title;
  group.description = description;
  saveEquipments();
  window.location.hash = `#/equipments/${groupId}`
}

/**
 * @param {Event} event 
 * @param {Function?} callback
 */
export async function handleGetFakeEquipments(event, callback) {
  const { values: { userId }, form } = handleForm(event)
  const groupId = Number(form.dataset.groupId)
  Maybe.of(await getFakeEquipmentsForUser(Number(userId)))
    .bind(equipments => equipments.map(equipment => ({ ...equipment, groupId })))
    .do(equipments => {
      const group = getGroup({ id: groupId });
      if (!group) return null;
      group.equipments = group.equipments.concat(equipments);
      saveEquipments();
      if (callback) callback();
      Maybe.of(document.querySelector("#equipment-filter"))
        .bind(filter => filter instanceof HTMLSelectElement ? filter.value : null)
        .bind(filter => equipments.filter(equipment => filter === 'all' || String(equipment.done) === filter))
        .do(equipments => {
          const equipmentList = document.querySelector(".equipments__list");
          if (!equipmentList) return null;
          equipmentList.insertAdjacentHTML("beforeend", getEquipmentsTemplate({ ...group, equipments }));
        })
    })
}

/**
 * @param {Event} event 
 */
export function handleForm(event) {
  event.preventDefault();
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) throw new Error("form is not an instance of HTMLFormElement");
  /** @type {{[key: string]: string}} */
  const values = {};
  /** @type {NodeListOf<HTMLInputElement | HTMLSelectElement>} */
  const inputs = form.querySelectorAll('input[name],select[name]');
  inputs.forEach(input => {
    values[input.name] = sanitize(input.value);
    input.value = "";
  });
  return { values, form };
}