package com.neisser.springboot_plantilla.service;

import com.neisser.springboot_plantilla.model.Tarea;
import com.neisser.springboot_plantilla.repository.TareaRepository;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class TareaService {
    private final TareaRepository repositorio;

    public TareaService(final TareaRepository repositorio) {
        this.repositorio = repositorio;
    }

    @Transactional(readOnly = true)
    public List<Tarea> verTodasLasTareas() {
        return repositorio.findAll();
    }

    @Transactional(readOnly = true)
    public Tarea buscarPorID(Long id) {
        return repositorio.findById(id).orElse(null);
    }

    @Transactional
    public Tarea crearTarea(Tarea tarea){
        return repositorio.save(tarea);
    }

    @Transactional
    public Tarea actualizarTarea(Long id, Tarea tarea){
        Tarea existente=buscarPorID(id);
        existente.setTitulo(tarea.getTitulo());
        existente.setDescripcion(tarea.getDescripcion());
        existente.setCompletada(tarea.isCompletada());
        return repositorio.save(existente);
    }

    @Transactional
    public Tarea marcarComoCompletada(Long id){
        Tarea tarea=buscarPorID(id);
        tarea.setCompletada(true);
        return repositorio.save(tarea);
    }

    @Transactional
    public void eliminar(Long id){
        repositorio.deleteById(id);
    }
}