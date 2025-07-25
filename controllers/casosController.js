const helpError = require('../utils/errorHandler');
const helpID = require('uuid');
const casosRepository = require("../repositories/casosRepository")
const agentesRepository = require("../repositories/agentesRepository");
const express = require('express');




function getAllCasos(req, res) {

        const casos = casosRepository.findAll()
        let result = casos;
        if (req.query.agente_id)
                result = result.filter(c => c.agente_id === req.query.agente_id);
        if (req.query.status)
                result = result.filter(c => c.status === req.query.status.toLowerCase());

        return res.status(200).json(result);
}

function getCasoById(req, res, next) {
        const id = req.params.id
        const caso = casosRepository.findById(id)
        if (!caso)
                return res.status(404).json(helpError.ErrorMessageID(404, id, "caso"));
        else
                return res.status(200).json(caso)
}

function getAgenteByCasoId(req, res, next) {
        const caso_id = req.params.id
        const caso = casosRepository.findById(caso_id);
        if (!caso)
                return res.status(404).json(helpError.ErrorMessageID(404, caso_id, "caso"));
        const agente_id = caso.agente_id;
        const agente = agentesRepository.findById(agente_id);
        if (!agente)
                return res.status(404).json(helpError.ErrorMessageID(404, agente_id, "agente"));
        return res.status(200).json(agente);
}

function getAllCasosBySearch(req, res) {
        const casos = casosRepository.findAll();
        if (req.query.q)
                return res.status(200).json(casos.filter(c => c.titulo.toLowerCase().includes(req.query.q.toLowerCase()) || c.descricao.toLowerCase().includes(req.query.q.toLowerCase())));
        return res.status(200).json(casos);
}

function createCaso(req, res) {

        const titulo = req.body.titulo
        const descricao = req.body.descricao
        const status = (req.body.status).toLowerCase()
        const agente_id = req.body.agente_id
        const agente = agentesRepository.findById(agente_id);

        if (!titulo)
                return res.status(400).json(helpError.ErrorMessage(400, "titulo"));
        if (!descricao)
                return res.status(400).json(helpError.ErrorMessage(400, "descricao"));
        if (!status || (status !== "aberto" && status !== "solucionado"))
                return res.status(400).json(helpError.ErrorMessage(400, "status", status));
        if (!agente_id)
                return res.status(400).json(helpError.ErrorMessage(400, "agente_id"));
        if (!agente)
                return res.status(404).json(helpError.ErrorMessageID(404, agente_id, "agente"));

        return res.status(201).json(casosRepository.AdicionarCaso(titulo, descricao, status, agente_id))
}

function updateCaso(req, res) {
        const id = req.params.id
        if (req.body.id && req.body.id !== id) {
                return res.status(400).json({ message: "Não é permitido alterar o ID do caso." });
        }
        const caso = casosRepository.findById(id);
        if (!caso)
                return res.status(404).json(helpError.ErrorMessageID(404, id, "caso"));

        const titulo = req.body.titulo
        const descricao = req.body.descricao
        const status = (req.body.status)
        const agente_id = req.body.agente_id
        const agente = agentesRepository.findById(agente_id);

        if (!titulo)
                return res.status(400).json(helpError.ErrorMessage(400, "titulo"));
        if (!descricao)
                return res.status(400).json(helpError.ErrorMessage(400, "descricao"));
        if (!status || (status !== "aberto" && status !== "solucionado"))
                return res.status(400).json(helpError.ErrorMessage(400, "status",status));
        if (!agente_id || !agente)
                return res.status(400).json(helpError.ErrorMessage(400, "agente_id"));

        return res.status(200).json(casosRepository.AtualizarCaso(id, titulo, descricao, status, agente_id))
}

function updateCasoParcial(req, res) {
    const id = req.params.id;

    if (req.body.id && req.body.id !== id) {
        return res.status(400).json({ message: "Não é permitido alterar o ID do caso." });
    }

    const caso = casosRepository.findById(id);
    if (!caso) {
        return res.status(404).json(helpError.ErrorMessageID(404, id, "caso"));
    }

    const camposAtualizados = {};

    const titulo = req.body.titulo;
    const descricao = req.body.descricao;
    const status = req.body.status;
    const agente_id = req.body.agente_id;

    // Validação e adição de campos ao objeto atualizado
    if (titulo !== undefined) {
        if (!titulo) {
            return res.status(400).json(helpError.ErrorMessage(400, "titulo"));
        }
        camposAtualizados.titulo = titulo;
    }

    if (descricao !== undefined) {
        if (!descricao) {
            return res.status(400).json(helpError.ErrorMessage(400, "descricao"));
        }
        camposAtualizados.descricao = descricao;
    }

    if (status !== undefined) {
        const statusLower = status.toLowerCase();
        if (!["aberto", "solucionado"].includes(statusLower)) {
            return res.status(400).json(helpError.ErrorMessage(400, "status",status));
        }
        camposAtualizados.status = statusLower;
    }

    if (agente_id !== undefined) {
        const agente = agentesRepository.findById(agente_id);
        if (!agente) {
            return res.status(404).json(helpError.ErrorMessageID(404, agente_id, "agente"));
        }
        camposAtualizados.agente_id = agente_id;
    }

    const casoAtualizado = casosRepository.AtualizarCasoParcial(id, camposAtualizados);
    return res.status(200).json(casoAtualizado);
}


function deleteCaso(req, res) {
        const id = req.params.id
        const caso = casosRepository.findById(id);
        if (!caso)
                return res.status(404).json(helpError.ErrorMessageID(404, id, "caso"));

        casosRepository.RemoverCaso(id);
        return res.sendStatus(204);
}

module.exports = {
        getAllCasos,
        getCasoById,
        getAgenteByCasoId,
        getAllCasosBySearch,
        createCaso,
        updateCaso,
        updateCasoParcial,
        deleteCaso
}