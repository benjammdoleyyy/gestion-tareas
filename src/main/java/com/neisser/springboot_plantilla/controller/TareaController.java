package com.neisser.springboot_plantilla.controller;

import com.neisser.springboot_plantilla.model.Tarea;
import com.neisser.springboot_plantilla.service.TareaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/tareas")
public class TareaController {
    private TareaService servicio;

    public TareaController(final TareaService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
  public ResponseEntity<List<Tarea>> verTodas(){
        return ResponseEntity.ok(servicio.verTodasLasTareas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tarea> verPorID(@PathVariable Long id){
        return ResponseEntity.ok(servicio.buscarPorID(id));
    }

    @PostMapping
    public ResponseEntity<Tarea> guardarTarea(@RequestBody Tarea tarea){
        return ResponseEntity.status(HttpStatus.CREATED).body(servicio.crearTarea(tarea));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tarea> actualizarTarea(@PathVariable Long id, @RequestBody Tarea tareaActualizada){
       return ResponseEntity.ok(servicio.actualizarTarea(id, tareaActualizada));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable Long id){
    servicio.eliminar(id);
    return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Tarea> completada(@PathVariable Long id){
        return ResponseEntity.ok(servicio.marcarComoCompletada(id));
    }
}