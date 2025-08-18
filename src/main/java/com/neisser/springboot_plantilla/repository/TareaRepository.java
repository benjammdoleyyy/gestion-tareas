package com.neisser.springboot_plantilla.repository;

import com.neisser.springboot_plantilla.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TareaRepository extends JpaRepository<Tarea, Long> {
}
