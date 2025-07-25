const agentesRepository = require("../repositories/agentesRepository")
const helpError = require('../utils/errorHandler');
const moment = require('moment');
const helpID = require('uuid');
const express = require('express');

function getAllAgentes(req, res) {
        const agentes = agentesRepository.findAll()
        let result = agentes;
        if (req.query.cargo)
                result = result.filter(a => a.cargo === req.query.cargo);
        if (req.query.sort) {
                if (req.query.sort[0] === "-")
                        result = result.sort((a, b) => a.dataDeIncorporacao.localeCompare(b.dataDeIncorporacao)).reverse();
                else
                        result = result.sort((a, b) => a.dataDeIncorporacao.localeCompare(b.dataDeIncorporacao));
        }
        return res.status(200).json(result);
}

function getAgenteById(req, res, next) {
        const id = req.params.id
        const agente = agentesRepository.findById(id)
        if (!agente)
                return res.status(404).json(helpError.ErrorMessageID(404, id, "agente"));
        else
                return res.status(200).json(agente)
}

function createAgente(req, res) {
        const nome = req.body.nome
        const dataDeIncorporacao = req.body.dataDeIncorporacao
        const dataFormatada = moment(dataDeIncorporacao, "YYYY-MM-DD", true);
        const cargo = req.body.cargo

        if (!nome)
                return res.status(400).json(helpError.ErrorMessage(400, "nome"));
        if (!dataDeIncorporacao || !dataFormatada.isValid() || dataFormatada.isAfter(moment()))
                return res.status(400).json(helpError.ErrorMessage(400, "dataDeIncorporacao"));
        if (!cargo)
                return res.status(400).json(helpError.ErrorMessage(400, "cargo"));

        const novoAgente = agentesRepository.AdicionarAgente(nome, dataDeIncorporacao, cargo)
        return res.status(201).json(novoAgente)
}

function updateAgente(req, res) {
        const id = req.params.id
        if (req.body.id && req.body.id !== id) {
                return res.status(400).json({ message: "Não é permitido alterar o ID do agente." });
        }
        const agente = agentesRepository.findById(id);
        if (!agente)
                return res.status(404).json(helpError.ErrorMessageID(404, id, "agente"));

        const camposAtualizados = {};

        const nome = req.body.nome
        const dataDeIncorporacao = req.body.dataDeIncorporacao
        const cargo = req.body.cargo

        if (!nome)
                return res.status(400).json(helpError.ErrorMessage(400, "nome"));
        if (!dataDeIncorporacao)
                return res.status(400).json(helpError.ErrorMessage(400, "dataDeIncorporacao"));
        if (!cargo)
                return res.status(400).json(helpError.ErrorMessage(400, "cargo"));

        camposAtualizados.nome = nome;
        camposAtualizados.dataDeIncorporacao = dataDeIncorporacao;
        camposAtualizados.cargo = cargo;

        return res.status(200).json(agentesRepository.AtualizarAgente(id, camposAtualizados));
}

function updateAgenteParcial(req, res) {
    const id = req.params.id;

    if (req.body.id && req.body.id !== id) {
        return res.status(400).json({ message: "Não é permitido alterar o ID do agente." });
    }

    const agente = agentesRepository.findById(id);
    if (!agente) {
        return res.status(404).json(helpError.ErrorMessageID(404, id, "agente"));
    }

    const camposAtualizados = {};

    const nome = req.body.nome;
    const dataDeIncorporacao = req.body.dataDeIncorporacao;
    const cargo = req.body.cargo;

    // Validações parciais:
    if (nome !== undefined) {
        if (!nome) {
            return res.status(400).json(helpError.ErrorMessage(400, "nome"));
        }
        camposAtualizados.nome = nome;
    }

    if (dataDeIncorporacao !== undefined) {
    if (!dataDeIncorporacao || dataDeIncorporacao.trim() === "") {
        return res.status(400).json(helpError.ErrorMessage(400, "dataDeIncorporacao"));
    }
    const dataFormatada = moment(dataDeIncorporacao, "YYYY-MM-DD", true);
    if (!dataFormatada.isValid() || dataFormatada.isAfter(moment())) {
        return res.status(400).json(helpError.ErrorMessage(400, "dataDeIncorporacao"));
    }
    camposAtualizados.dataDeIncorporacao = dataDeIncorporacao;
}

    if (cargo !== undefined) {
        if (!cargo) {
            return res.status(400).json(helpError.ErrorMessage(400, "cargo"));
        }
        camposAtualizados.cargo = cargo;
    }

    const agenteAtualizado = agentesRepository.AtualizarAgenteParcial(id, camposAtualizados);
    return res.status(200).json(agenteAtualizado);
}


function deleteAgente(req, res) {
        const id = req.params.id
        const agente = agentesRepository.findById(id);
        if (!agente)
                return res.status(404).json(helpError.ErrorMessageID(404, id, "agente"));

        agentesRepository.RemoverAgente(id);
        return res.sendStatus(204);

}

module.exports = {
        getAllAgentes,
        getAgenteById,
        createAgente,
        updateAgente,
        updateAgenteParcial,
        deleteAgente
}